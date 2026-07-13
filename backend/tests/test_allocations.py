from unittest.mock import patch

from services.saw_engine import GoalSAWResult

FLEXIBLE_INCOME_TXN = {
    "id": "t1",
    "tipe_transaksi": "Pemasukan",
    "nominal": 200_000,
    "kategori": {"flag_pemasukan": "Flexible Side Income"},
}


def _ranked(goal_id="goal-1", nama_goal="Dana Darurat"):
    return [GoalSAWResult(goal_id=goal_id, nama_goal=nama_goal, score=0.9, rank=1, criteria_scores={})]


class TestSuggestAllocation:
    def test_transaction_not_found_returns_404(self, api_client, fake_db):
        fake_db.queue("transaksi", [])
        resp = api_client.post("/api/allocations/suggest", json={"transaksi_id": "t1"})
        assert resp.status_code == 404

    def test_expense_transaction_rejected_with_400(self, api_client, fake_db):
        fake_db.queue(
            "transaksi",
            [{"id": "t1", "tipe_transaksi": "Pengeluaran", "nominal": 50_000, "kategori": {"flag_pemasukan": None}}],
        )
        resp = api_client.post("/api/allocations/suggest", json={"transaksi_id": "t1"})
        assert resp.status_code == 400

    def test_fixed_routine_income_rejected_with_400(self, api_client, fake_db):
        fake_db.queue(
            "transaksi",
            [{"id": "t1", "tipe_transaksi": "Pemasukan", "nominal": 50_000, "kategori": {"flag_pemasukan": "Fixed Routine"}}],
        )
        resp = api_client.post("/api/allocations/suggest", json={"transaksi_id": "t1"})
        assert resp.status_code == 400

    def test_no_active_goal_returns_has_goal_false_and_never_touches_saran_alokasi(self, api_client, fake_db):
        fake_db.queue("transaksi", [FLEXIBLE_INCOME_TXN])
        # Deliberately no `fake_db.queue("saran_alokasi", ...)` here -- if the
        # router wrote a pending row anyway when there's no goal to suggest,
        # FakeSupabaseClient raises on the unexpected call and fails the test.
        with patch("routers.allocations.rank_user_goals", return_value=[]):
            resp = api_client.post("/api/allocations/suggest", json={"transaksi_id": "t1"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["has_goal"] is False
        assert body["nominal_alokasi_disarankan"] == 0
        assert body["goal_id"] is None

    def test_suggestion_is_35_percent_and_writes_only_to_saran_alokasi_never_alokasi(self, api_client, fake_db):
        fake_db.queue("transaksi", [FLEXIBLE_INCOME_TXN])
        fake_db.queue("saran_alokasi", [])  # upsert return value; router doesn't use it
        # Deliberately no `fake_db.queue("alokasi", ...)` -- suggest must
        # never write to the real allocation table (that's confirm's job).
        with patch("routers.allocations.rank_user_goals", return_value=_ranked()):
            resp = api_client.post("/api/allocations/suggest", json={"transaksi_id": "t1"})
        assert resp.status_code == 200
        body = resp.json()
        assert body["has_goal"] is True
        assert body["goal_id"] == "goal-1"
        assert body["nama_goal"] == "Dana Darurat"
        assert body["nominal_alokasi_disarankan"] == 70_000
        assert body["persentase"] == 35


class TestListPendingAllocations:
    def test_empty_pending_returns_empty_list_without_computing_progress(self, api_client, fake_db):
        fake_db.queue("saran_alokasi", [])
        with patch("routers.allocations.compute_goal_progress") as mock_progress:
            resp = api_client.get("/api/allocations/pending")
        assert resp.status_code == 200
        assert resp.json() == []
        mock_progress.assert_not_called()

    def test_pending_rows_enriched_with_goal_progress(self, api_client, fake_db):
        fake_db.queue(
            "saran_alokasi",
            [
                {
                    "id": "p1",
                    "transaksi_id": "t1",
                    "goal_id": "goal-1",
                    "goal": {"nama_goal": "Dana Darurat"},
                    "nominal_alokasi_disarankan": 70_000,
                    "persentase": 35,
                    "pesan": "Side income masuk.",
                    "created_at": "2026-07-14T10:00:00+00:00",
                }
            ],
        )
        progress_rows = [{"id": "goal-1", "current_saved": 100_000.0, "nominal_target": 1_000_000.0, "progress_percent": 10.0}]
        with patch("routers.allocations.compute_goal_progress", return_value=progress_rows):
            resp = api_client.get("/api/allocations/pending")
        assert resp.status_code == 200
        [row] = resp.json()
        assert row["nama_goal"] == "Dana Darurat"
        assert row["current_saved"] == 100_000.0
        assert row["progress_percent"] == 10.0


class TestDismissAllPendingAllocations:
    def test_returns_204(self, api_client, fake_db):
        fake_db.queue("saran_alokasi", [])
        resp = api_client.delete("/api/allocations/pending")
        assert resp.status_code == 204


class TestConfirmAllocation:
    def _payload(self, **overrides):
        payload = {"transaksi_id": "t1", "goal_id": "goal-1", "nominal_alokasi": 70_000}
        payload.update(overrides)
        return payload

    def test_transaction_not_found_returns_404(self, api_client, fake_db):
        fake_db.queue("transaksi", [])
        resp = api_client.post("/api/allocations/confirm", json=self._payload())
        assert resp.status_code == 404

    def test_goal_not_found_returns_404(self, api_client, fake_db):
        fake_db.queue("transaksi", [{"id": "t1", "nominal": 200_000}])
        fake_db.queue("goal", [])
        resp = api_client.post("/api/allocations/confirm", json=self._payload())
        assert resp.status_code == 404

    def test_nominal_exceeding_transaction_rejected_with_400_and_never_inserts(self, api_client, fake_db):
        fake_db.queue("transaksi", [{"id": "t1", "nominal": 100_000}])
        fake_db.queue("goal", [{"id": "goal-1"}])
        # Already 80k allocated; requesting another 70k would exceed the 100k txn.
        fake_db.queue("alokasi", [{"nominal_alokasi": 80_000}])
        # No second "alokasi" queue entry -- an insert attempt after the
        # guard should trigger would raise in FakeSupabaseClient.
        resp = api_client.post("/api/allocations/confirm", json=self._payload())
        assert resp.status_code == 400

    def test_successful_confirm_inserts_alokasi_and_clears_pending_suggestion(self, api_client, fake_db):
        fake_db.queue("transaksi", [{"id": "t1", "nominal": 200_000}])
        fake_db.queue("goal", [{"id": "goal-1"}])
        fake_db.queue("alokasi", [])  # no prior allocations for this transaction
        fake_db.queue(
            "alokasi",
            [
                {
                    "id": "a1",
                    "nominal_alokasi": 70_000,
                    "tanggal_alokasi": "2026-07-14",
                    "transaksi_id": "t1",
                    "goal_id": "goal-1",
                }
            ],
        )
        fake_db.queue("saran_alokasi", [])  # marking the pending row confirmed
        resp = api_client.post("/api/allocations/confirm", json=self._payload())
        assert resp.status_code == 201
        body = resp.json()
        assert body["id"] == "a1"
        assert body["nominal_alokasi"] == 70_000

    def test_insert_returning_no_data_raises_400(self, api_client, fake_db):
        fake_db.queue("transaksi", [{"id": "t1", "nominal": 200_000}])
        fake_db.queue("goal", [{"id": "goal-1"}])
        fake_db.queue("alokasi", [])
        fake_db.queue("alokasi", [])  # insert "succeeds" but returns no rows
        resp = api_client.post("/api/allocations/confirm", json=self._payload())
        assert resp.status_code == 400

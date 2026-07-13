def _wallet_row(**overrides):
    row = {
        "id": "w1",
        "pengguna_id": "test-user-id",
        "nama_dompet": "Dompet Utama",
        "icon": "Banknote",
        "warna": "#22C55E",
        "saldo": 100_000.0,
        "created_at": "2026-07-14T10:00:00+00:00",
    }
    row.update(overrides)
    return row


class TestListWallets:
    def test_returns_the_users_wallets(self, api_client, fake_db):
        fake_db.queue("dompet", [_wallet_row()])
        resp = api_client.get("/api/wallets")
        assert resp.status_code == 200
        [wallet] = resp.json()
        assert wallet["id"] == "w1"


class TestCreateWallet:
    def test_creates_and_returns_the_new_wallet(self, api_client, fake_db):
        fake_db.queue("dompet", [_wallet_row(id="w2", nama_dompet="GoPay", icon="Smartphone")])
        resp = api_client.post(
            "/api/wallets",
            json={"nama_dompet": "GoPay", "icon": "Smartphone", "warna": "#22C55E", "saldo": 0},
        )
        assert resp.status_code == 201
        assert resp.json()["nama_dompet"] == "GoPay"

    def test_empty_name_rejected_before_hitting_the_database(self, api_client, fake_db):
        # No `fake_db.queue(...)` at all -- validation must fail before any
        # `.table()` call, otherwise FakeSupabaseClient raises.
        resp = api_client.post("/api/wallets", json={"nama_dompet": "", "icon": "Banknote", "warna": "#22C55E"})
        assert resp.status_code == 422

    def test_invalid_hex_color_rejected_before_hitting_the_database(self, api_client, fake_db):
        resp = api_client.post(
            "/api/wallets", json={"nama_dompet": "Dompet", "icon": "Banknote", "warna": "not-a-color"}
        )
        assert resp.status_code == 422

    def test_insert_returning_no_data_raises_400(self, api_client, fake_db):
        fake_db.queue("dompet", [])
        resp = api_client.post(
            "/api/wallets", json={"nama_dompet": "GoPay", "icon": "Smartphone", "warna": "#22C55E"}
        )
        assert resp.status_code == 400


class TestUpdateWallet:
    def test_updates_provided_fields(self, api_client, fake_db):
        fake_db.queue("dompet", [_wallet_row(saldo=250_000.0)])
        resp = api_client.put("/api/wallets/w1", json={"saldo": 250_000})
        assert resp.status_code == 200
        assert resp.json()["saldo"] == 250_000.0

    def test_missing_wallet_returns_404(self, api_client, fake_db):
        fake_db.queue("dompet", [])
        resp = api_client.put("/api/wallets/does-not-exist", json={"saldo": 1})
        assert resp.status_code == 404

    def test_empty_payload_is_a_no_op_read_not_an_update(self, api_client, fake_db):
        # An all-omitted PUT body should read the existing row back rather
        # than issue an `.update()` with an empty field set.
        fake_db.queue("dompet", [_wallet_row()])
        resp = api_client.put("/api/wallets/w1", json={})
        assert resp.status_code == 200
        assert resp.json()["id"] == "w1"

    def test_empty_payload_on_missing_wallet_returns_404(self, api_client, fake_db):
        fake_db.queue("dompet", [])
        resp = api_client.put("/api/wallets/does-not-exist", json={})
        assert resp.status_code == 404


class TestDeleteWallet:
    def test_missing_wallet_returns_404(self, api_client, fake_db):
        fake_db.queue("dompet", [])
        resp = api_client.delete("/api/wallets/does-not-exist")
        assert resp.status_code == 404

    def test_wallet_with_linked_transactions_is_blocked_with_409_and_not_deleted(self, api_client, fake_db):
        fake_db.queue("dompet", [{"id": "w1"}])  # existence check
        fake_db.queue("transaksi", [{"id": "tx1"}])  # linked transaction found
        # No second "dompet" queue entry for `.delete()` -- if the router
        # deleted anyway despite the guard, FakeSupabaseClient would raise.
        resp = api_client.delete("/api/wallets/w1")
        assert resp.status_code == 409

    def test_wallet_with_no_linked_transactions_is_deleted(self, api_client, fake_db):
        fake_db.queue("dompet", [{"id": "w1"}])  # existence check
        fake_db.queue("transaksi", [])  # no linked transactions
        fake_db.queue("dompet", [{"id": "w1"}])  # delete return value (unused)
        resp = api_client.delete("/api/wallets/w1")
        assert resp.status_code == 204

"""Lightweight fakes for router-level integration tests.

FakeSupabaseClient does NOT replicate PostgREST filter/join/RLS semantics --
it's a FIFO queue of pre-baked `.execute()` results, keyed by table name, in
the exact order the router under test is expected to call `.table(name)`.
That's enough to exercise a router's own control flow (guard clauses, which
table gets written, status codes) without a real database.

Service functions that make their *own* nested DB calls (rank_user_goals,
compute_goal_progress, etc.) are out of scope for this fake -- patch them
directly at the router-module level instead (see test_allocations.py). This
keeps router tests from being coupled to -- and broken by -- unrelated
refactors deep inside those services, which already have their own
unit/behavioral coverage (see test_saw_engine.py and STATUS.md's manual
verification notes).
"""

from types import SimpleNamespace


class FakeResult(SimpleNamespace):
    def __init__(self, data=None):
        super().__init__(data=data if data is not None else [])


class _FakeQueryBuilder:
    def __init__(self, client: "FakeSupabaseClient", table_name: str):
        self._client = client
        self._table_name = table_name

    def __getattr__(self, _name):
        # Any PostgREST builder method not defined above (select, insert,
        # update, upsert, delete, eq, gte, lte, order, limit, in_, ...)
        # returns self, so arbitrary chains just accumulate and are ignored
        # until `.execute()`.
        def _chain(*_args, **_kwargs):
            return self

        return _chain

    def execute(self) -> FakeResult:
        return self._client._pop(self._table_name)


class FakeSupabaseClient:
    def __init__(self):
        self._queues: dict[str, list] = {}

    def queue(self, table_name: str, data=None) -> "FakeSupabaseClient":
        """Queue the `.data` a future `.table(table_name)....execute()` call
        should return. Repeated calls to the same table are served FIFO, in
        the order the router code is expected to issue them."""
        self._queues.setdefault(table_name, []).append(data if data is not None else [])
        return self

    def table(self, table_name: str) -> _FakeQueryBuilder:
        return _FakeQueryBuilder(self, table_name)

    def _pop(self, table_name: str) -> FakeResult:
        queue = self._queues.get(table_name)
        if not queue:
            raise AssertionError(
                f"FakeSupabaseClient: unexpected call to table '{table_name}' "
                "-- no result queued (check the call order matches the router "
                "under test, or that a nested service call needed patching "
                "instead of queuing)"
            )
        return FakeResult(queue.pop(0))

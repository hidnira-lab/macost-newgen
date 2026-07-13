from pydantic import BaseModel, Field, model_validator


class SAWWeights(BaseModel):
    personal_importance: float = Field(ge=0, le=100)
    progress_gap: float = Field(ge=0, le=100)
    saving_capacity: float = Field(ge=0, le=100)
    urgency: float = Field(ge=0, le=100)
    target_amount: float = Field(ge=0, le=100)

    @model_validator(mode="after")
    def check_total(self) -> "SAWWeights":
        total = (
            self.personal_importance
            + self.progress_gap
            + self.saving_capacity
            + self.urgency
            + self.target_amount
        )
        if abs(total - 100) > 1:
            raise ValueError(f"Total bobot harus 100% (saat ini {total:g}%)")
        return self

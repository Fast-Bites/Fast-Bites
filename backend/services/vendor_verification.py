from models.restaurant import Restaurant

VENDOR_VERIFICATION_STAGES = ("registration", "documentation", "pending_review", "verified")


def verification_stage_for_restaurant(restaurant: Restaurant | None) -> str:
    if not restaurant:
        return "registration"
    if restaurant.business_verified:
        return "verified"
    if restaurant.verification_submitted_at:
        if restaurant.verification_documents:
            return "pending_review"
        return "documentation"
    return "registration"

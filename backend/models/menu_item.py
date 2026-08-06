"""Back-compat re-export — prefer models.product.Product."""

from models.product import MenuItem, Product

__all__ = ["MenuItem", "Product"]

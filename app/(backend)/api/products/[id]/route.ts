import { createContext } from "@/server/lib/api-handler";
import { UpdateProductSchema } from "@/shared/types/products.types";

export const GET = createContext(
  (container) => container.getProductByIdController,
);

export const PATCH = createContext(
  (container) => container.updateProductController,
  async (req) => {
    const body = await req.json();
    return UpdateProductSchema.parse(body);
  },
);

export const DELETE = createContext(
  (container) => container.deleteProductController,
);

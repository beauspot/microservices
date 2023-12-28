import { ProductServiceClass } from "../services/products.service";
import slugify from "slugify";
// import { AuthenticatedRequest } from "../helpers/interfaces/authenticateRequest";
import { validateMongoDbID } from "../helpers/utils/validateDbId";
import {
  GetAllProductsOptions,
  GetAllProductsQueryParams,
} from "../helpers/interfaces/product_Interface";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ProductServiceController {
  public static createProductController = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    // calling the createProduct controller
    const newProduct = await ProductServiceClass.createProductService(req.body);
    //console.log(newProduct);
    res
      .status(StatusCodes.CREATED)
      .json({ ProductData: { ProductDetail: newProduct } });
  };

  public static getAllProducts = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { sortBy, sortOrder, limit, page, category, brand } =
      req.query as GetAllProductsQueryParams;

    const filterOpt: GetAllProductsOptions = {
      sortBy: sortBy || "createdAt", // Default sort order
      sortOrder: sortOrder === "desc" ? "desc" : "asc",
      limit: limit ? parseInt(limit.toString(), 10) : 10,
      page: page ? parseInt(page.toString(), 10) : 1,
      category: category || "",
      brand: brand || "",
    };

    const paginatedProducts = await ProductServiceClass.getAllProductsService(
      filterOpt
    );
    res.status(StatusCodes.OK).json(paginatedProducts);
  };

  public static getSingleProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    validateMongoDbID(id);
    //console.log(id);
    const productDataID = await ProductServiceClass.getSingleProductService(id);
    res.status(StatusCodes.OK).json({ product: productDataID });
  };

  public static updateSingleProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    const { id } = req.params;
    validateMongoDbID(id);
    // console.log(id);
    const updateProduct = await ProductServiceClass.updateProductService(
      id,
      req.body
    );
    res
      .status(StatusCodes.OK)
      .json({ status: "Successfully updated product", updateProduct });
  };

  public static deleteProduct = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    validateMongoDbID(id);
    const productDataID = await ProductServiceClass.deleteProductService(id);
    res.status(StatusCodes.OK).json({
      status: "Deleted product Successfully",
      productDataID: productDataID,
    });
  };
}

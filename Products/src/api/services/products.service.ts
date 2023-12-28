import { productModel } from "../models/products";
import { Paginated } from "../helpers/interfaces/paginatedInterface";
import {
  ProductDataInterface,
  GetAllProductsOptions,
} from "../helpers/interfaces/product_Interface";

export class ProductServiceClass {
  public static createProductService = async (
    product: ProductDataInterface
  ) => {
    const newProduct = await productModel.create({ ...product });
    if (!newProduct) {
      throw new Error("Product creation failed");
    }
    return newProduct;
  };

  public static getAllProductsService = async (
    options: GetAllProductsOptions
  ): Promise<Paginated<ProductDataInterface>> => {
    // Sorting, limiting and pagination of the Products
    const { sortBy, sortOrder, limit, page, category, brand } = options;
    const skip = (page - 1) * limit;

    const sortCriteria: any = {};
    sortCriteria[sortBy] = sortOrder === "asc" ? 1 : -1;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    const allProducts = await productModel
      .find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .exec();

    if (allProducts.length <= 0) {
      throw new Error("No products found");
    }
    const productsCount: number = await productModel
      .find(query)
      .countDocuments();

    return {
      page: allProducts,
      currentPage: page,
      totalPages: Math.ceil(productsCount / limit),
      total: productsCount,
    };
  };

  public static getSingleProductService = async (productID: string) => {
    const productExists = await productModel.findById({ _id: productID });
    // console.log(productExists);
    if (!productExists) {
      throw new Error(`the product with the id ${productID} does not exist`);
    }
    return productExists;
  };

  public static updateProductService = async (
    prodId: string,
    updateData: Partial<ProductDataInterface>
  ) => {
    // const { _id } = prodId;
    const updateProduct = await productModel.findByIdAndUpdate(
      { _id: prodId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    // console.log(prodId);
    if (!updateProduct)
      throw new Error(
        `The Product with the id: ${prodId} was not found to be updated.`
      );
    return updateProduct;
  };

  public static deleteProductService = async (prodID: string) => {
    const product = await productModel.findOneAndDelete({ _id: prodID });
    // console.log(product);
    if (!product)
      throw new Error(
        `The Product with the id: ${prodID} was not found to be deleted`
      );
    return product;
  };

  public static rateProductService = async (
    userID: string,
    prodID: string,
    star: number,
    comment: string
  ) => {
    try {
      const product = await productModel.findById(prodID);
      if (!product) {
        throw new Error(`Product not found`);
      }
      let alreadyRated = product.ratings.find(
        (rating) => rating.postedBy.toString() === userID
      );
      if (alreadyRated) {
        await productModel.updateOne(
          {
            "ratings.postedBy": userID,
          },
          {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          }
        );
      } else {
        await productModel.findByIdAndUpdate(prodID, {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: userID,
            },
          },
        });
      }
      const getAllRatings = await productModel.findById(prodID);
      if (!getAllRatings) {
        throw new Error(`Ratings not found`);
      }
      let totalRating = getAllRatings.ratings.length;
      let ratingsum =
        totalRating === 0
          ? 0
          : getAllRatings.ratings
              .map((item) => item.star)
              .reduce((prev, curr) => prev + curr, 0);
      let actualRating =
        totalRating === 0 ? 0 : Math.round(ratingsum / totalRating);

      const finalproduct = await productModel.findByIdAndUpdate(
        prodID,
        {
          totalrating: actualRating,
        },
        { new: true }
      );
      return finalproduct;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };
    
    
}

const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// ===============================
// GET ACTIVE PRODUCTS
// ===============================
const getProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find({
        status: "active",
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      products,
    });

  } catch (error) {
    console.log(
      "GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load products",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL PRODUCTS - ADMIN
// ===============================
const getAllProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find().sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      products,
    });

  } catch (error) {
    console.log(
      "GET ALL PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load all products",
      error: error.message,
    });
  }
};

// ===============================
// GET SINGLE PRODUCT
// ===============================
const getProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.log(
      "GET PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load product",
      error: error.message,
    });
  }
};

// ===============================
// ADD PRODUCT
// ===============================
const addProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      category,
      price,
      unit,
      stock,
      description,
      status,
    } = req.body;

    // Validate
    if (
      !name ||
      !category ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category and price are required",
      });
    }

    // Create image URL
    let image = "";

    if (req.file) {
      image =
        `${req.protocol}://${req.get(
          "host"
        )}/uploads/products/${req.file.filename}`;
    }

    const product =
      await Product.create({
        name: name.trim(),

        category:
          category.trim(),

        price: Number(price),

        unit:
          unit || "1 kg",

        stock:
          Number(stock) || 0,

        description:
          description || "",

        image,

        status:
          status || "active",
      });

    return res.status(201).json({
      success: true,
      message:
        "Product added successfully",
      product,
    });

  } catch (error) {
    console.log(
      "ADD PRODUCT ERROR:",
      error
    );

    // Delete uploaded image if database save failed
    if (req.file) {
      const filePath =
        path.join(
          __dirname,
          "..",
          "uploads",
          "products",
          req.file.filename
        );

      if (
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to add product",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE PRODUCT
// ===============================
const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      price,
      unit,
      stock,
      description,
      status,
    } = req.body;

    // If new image uploaded
    if (req.file) {
      // Delete old image
      if (product.image) {
        try {
          const oldImageName =
            product.image.split(
              "/"
            ).pop();

          const oldImagePath =
            path.join(
              __dirname,
              "..",
              "uploads",
              "products",
              oldImageName
            );

          if (
            fs.existsSync(
              oldImagePath
            )
          ) {
            fs.unlinkSync(
              oldImagePath
            );
          }
        } catch (imageError) {
          console.log(
            "OLD IMAGE DELETE ERROR:",
            imageError.message
          );
        }
      }

      product.image =
        `${req.protocol}://${req.get(
          "host"
        )}/uploads/products/${req.file.filename}`;
    }

    // Update fields
    if (name !== undefined) {
      product.name =
        name.trim();
    }

    if (category !== undefined) {
      product.category =
        category.trim();
    }

    if (price !== undefined) {
      product.price =
        Number(price);
    }

    if (unit !== undefined) {
      product.unit = unit;
    }

    if (stock !== undefined) {
      product.stock =
        Number(stock);
    }

    if (description !== undefined) {
      product.description =
        description;
    }

    if (status !== undefined) {
      product.status =
        status;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });

  } catch (error) {
    console.log(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product",
      error: error.message,
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image
    if (product.image) {
      try {
        const imageName =
          product.image
            .split("/")
            .pop();

        const imagePath =
          path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            imageName
          );

        if (
          fs.existsSync(imagePath)
        ) {
          fs.unlinkSync(
            imagePath
          );
        }
      } catch (imageError) {
        console.log(
          "IMAGE DELETE ERROR:",
          imageError.message
        );
      }
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });

  } catch (error) {
    console.log(
      "DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
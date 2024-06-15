import mongoose from "mongoose";
import { Category } from "../modles/category.model";

const createCategories = async (req, res) => {
  try {
    const category_one = new Category({ name: "Phone" });
    const category_two = new Category({ name: "laptop" });

    await category_one.save();
    await category_two.save();
    console.log("Category Created", category_one, category_two);
  } catch (error) {
    console.error("Error Creating Categories");
  }
};

createCategories();

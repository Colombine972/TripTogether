import type { RequestHandler } from "express";
import expenseCategoryRepository from "./expenseCategoryRepository";

const browse: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await expenseCategoryRepository.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export default { browse };
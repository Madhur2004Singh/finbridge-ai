import { listSchemes, getSchemeBySlug } from "../services/scheme.service.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getSchemes = async (req, res) => {
  const schemes = await listSchemes({
    category: req.query.category,
    occupation: req.query.occupation,
    incomeRange: req.query.incomeRange,
  });
  res.status(HTTP_STATUS.OK).json({
    success: true,
    schemes,
  });
};

export const getScheme = async (req, res) => {
  const scheme = await getSchemeBySlug(req.params.slug);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    scheme,
  });
};

export const getRecommendedSchemes = async (req, res) => {
  const recommendations = await getRecommendations(req.user, 6);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    recommendations,
  });
};

import {
  getSurveyForUser,
  saveSurveyForUser,
  regenerateProfile,
} from "../services/survey.service.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const getSurvey = async (req, res) => {
  const data = await getSurveyForUser(req.user.id);
  res.status(HTTP_STATUS.OK).json({ success: true, ...data });
};

export const getStatus = async (req, res) => {
  const { status } = await getSurveyForUser(req.user.id);
  res.status(HTTP_STATUS.OK).json({ success: true, status });
};

export const submitSurvey = async (req, res) => {
  const { responses, profile } = await saveSurveyForUser(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Survey saved and profile regenerated",
    responses,
    profile,
    status: profile.completionStatus,
  });
};

export const postRegenerateProfile = async (req, res) => {
  const profile = await regenerateProfile(req.user.id);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile regenerated",
    profile,
    status: profile.completionStatus,
  });
};

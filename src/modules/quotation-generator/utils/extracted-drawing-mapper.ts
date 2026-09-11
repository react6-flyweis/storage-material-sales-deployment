import type { ExtractedDrawingData } from "../estimates.api";

export interface ExtractedQuoteFormData {
  // Title Block
  purchaser: string;
  projectName: string;
  jobNumber: string;
  location: string;
  date: string;

  // Building Dimensions
  width: string;
  length: string;
  eaveHeight: string;
  sqFootage: string;
  baySpacing: string;
  roofSlope: string;

  // Design Loads
  roofDeadLoad: string;
  collateralLoad: string;
  roofLiveLoad: string;
  roofSnowLoad: string;
  groundSnowLoad: string;
  basicWindSpeed: string;
  windExposure: string;
  snowExposureFactor: string;
  intPressureCoeff: string;

  // Seismic, Site & Code
  occupancyCategory: string;
  siteClass: string;
  seismicDesignCat: string;
  seismicZone: string;
  sds: string;
  sd1: string;
  s1: string;
  thermalFactor: string;
  buildingCode: string;

  // Importance Factors & Base Shear
  windIF: string;
  snowIF: string;
  baseShearLong: string;
  baseShearTrans: string;
  deflectionLimitCol: string;

  // Building Type & Panels
  frameType: string;
  roofPanelColor: string;
  wallPanel: string;
  additionalNotes: string;
}

export const defaultExtractedQuoteFormData: ExtractedQuoteFormData = {
  purchaser: "",
  projectName: "",
  jobNumber: "",
  location: "",
  date: "",

  width: "",
  length: "",
  eaveHeight: "",
  sqFootage: "",
  baySpacing: "",
  roofSlope: "",

  roofDeadLoad: "",
  collateralLoad: "",
  roofLiveLoad: "",
  roofSnowLoad: "",
  groundSnowLoad: "",
  basicWindSpeed: "",
  windExposure: "",
  snowExposureFactor: "",
  intPressureCoeff: "",

  occupancyCategory: "",
  siteClass: "",
  seismicDesignCat: "",
  seismicZone: "",
  sds: "",
  sd1: "",
  s1: "",
  thermalFactor: "",
  buildingCode: "",

  windIF: "",
  snowIF: "",
  baseShearLong: "",
  baseShearTrans: "",
  deflectionLimitCol: "",

  frameType: "",
  roofPanelColor: "",
  wallPanel: "",
  additionalNotes: "",
};

export function mapExtractedDrawingToFormData(
  extracted?: ExtractedDrawingData,
  fallbacks?: {
    coverLabelMap?: Record<string, string>;
    quotationForm?: Record<string, string>;
    extractedShipperSqFt?: number;
  }
): Partial<ExtractedQuoteFormData> {
  if (!extracted && !fallbacks) return {};

  const coverLabelMap = fallbacks?.coverLabelMap;
  const quotationForm = fallbacks?.quotationForm;
  const shipperSqFt = fallbacks?.extractedShipperSqFt;

  const getCoverVal = (...keys: string[]): string => {
    if (!coverLabelMap) return "";
    for (const k of keys) {
      const lowerK = k.toLowerCase();
      if (coverLabelMap[k] !== undefined && coverLabelMap[k] !== "") return coverLabelMap[k];
      if (coverLabelMap[lowerK] !== undefined && coverLabelMap[lowerK] !== "") return coverLabelMap[lowerK];
      for (const [mapKey, mapVal] of Object.entries(coverLabelMap)) {
        if (mapKey.toLowerCase().trim() === lowerK.trim() && mapVal) return mapVal;
      }
    }
    return "";
  };

  return {
    // Title Block
    purchaser:
      extracted?.customer ||
      getCoverVal("customer", "purchaser", "client") ||
      quotationForm?.leadName ||
      "",
    projectName:
      extracted?.project ||
      getCoverVal("project", "projectName", "building") ||
      quotationForm?.projectName ||
      quotationForm?.leadName ||
      "",
    jobNumber:
      extracted?.jobnumber ||
      getCoverVal("jobNumber", "job", "job#") ||
      quotationForm?.jobNumber ||
      "",
    location:
      getCoverVal("location", "address", "city") ||
      quotationForm?.cityStateZip ||
      quotationForm?.street ||
      "",
    date:
      extracted?.date ||
      getCoverVal("date", "quoteDate") ||
      quotationForm?.quoteDate ||
      "",

    // Building Dimensions
    width:
      extracted?.width ||
      getCoverVal("width (ft)", "width", "w") ||
      quotationForm?.buildingSize?.split("x")[0] ||
      "",
    length:
      extracted?.length ||
      getCoverVal("length (ft)", "length", "l") ||
      quotationForm?.buildingSize?.split("x")[1] ||
      "",
    eaveHeight:
      extracted?.eave ||
      getCoverVal("eave height (ft)", "eave height", "eave", "height") ||
      quotationForm?.buildingSize?.split("x")[2] ||
      "",
    sqFootage:
      extracted?.sqft ||
      (shipperSqFt ? String(shipperSqFt) : "") ||
      getCoverVal("square footage", "sqft", "sq ft") ||
      quotationForm?.squareFootage ||
      "",
    baySpacing:
      extracted?.bay ||
      getCoverVal("bay spacing", "bay") ||
      "",
    roofSlope:
      extracted?.slope ||
      getCoverVal("roof slope (rise/12)", "roof slope", "slope", "pitch") ||
      "",

    // Design Loads
    roofDeadLoad:
      extracted?.dead ||
      getCoverVal("dead load (psf)", "dead load", "dead") ||
      "",
    collateralLoad:
      extracted?.collateral ||
      getCoverVal("collateral (psf)", "collateral load", "collateral") ||
      "",
    roofLiveLoad:
      extracted?.live ||
      getCoverVal("roof live load (psf)", "live load (psf)", "roof live load", "live") ||
      "",
    roofSnowLoad:
      extracted?.roofsnow ||
      getCoverVal("roof snow load", "roof snow", "snow load (psf)", "snow load") ||
      "",
    groundSnowLoad:
      extracted?.snow ||
      getCoverVal("ground snow load", "snow load (psf)", "snow") ||
      "",
    basicWindSpeed:
      extracted?.wind ||
      getCoverVal("wind speed(mph)", "wind speed (mph)", "wind speed", "wind") ||
      "",
    windExposure:
      extracted?.exposure ||
      getCoverVal("exposure", "wind exposure") ||
      "",
    snowExposureFactor:
      extracted?.snowexp ||
      getCoverVal("snow exposure factor", "snow exposure", "snowexp") ||
      "",
    intPressureCoeff:
      extracted?.ipc ||
      getCoverVal("internal pressure coefficient", "int pressure", "ipc") ||
      "",

    // Seismic, Site & Code
    occupancyCategory:
      extracted?.risk ||
      getCoverVal("risk category", "occupancy category", "risk", "closed/open") ||
      "",
    siteClass:
      extracted?.siteclass ||
      getCoverVal("site class", "siteclass") ||
      "",
    seismicDesignCat:
      extracted?.seismiccat ||
      getCoverVal("seismic design category", "seismic category", "seismiccat") ||
      "",
    seismicZone:
      extracted?.seismiczone ||
      getCoverVal("seismic zone", "seismiczone") ||
      "",
    sds:
      extracted?.seismic ||
      getCoverVal("sds", "seismic") ||
      "",
    sd1:
      extracted?.sd1 ||
      getCoverVal("sd1") ||
      "",
    s1:
      extracted?.s1 ||
      getCoverVal("s1") ||
      "",
    thermalFactor:
      extracted?.thermal ||
      getCoverVal("thermal factor", "thermal") ||
      "",
    buildingCode:
      extracted?.code ||
      getCoverVal("wind code", "building code", "code") ||
      "",

    // Importance Factors & Base Shear
    windIF:
      extracted?.windif ||
      getCoverVal("importance - wind", "wind importance factor", "windif") ||
      "",
    snowIF:
      extracted?.snowif ||
      getCoverVal("importance - snow", "importance - seismic", "snow importance factor", "snowif") ||
      "",
    baseShearLong:
      extracted?.shearlong ||
      getCoverVal("base shear long", "shearlong") ||
      "",
    baseShearTrans:
      extracted?.sheartrans ||
      getCoverVal("base shear trans", "sheartrans") ||
      "",
    deflectionLimitCol:
      extracted?.deflcol ||
      getCoverVal("deflection limit col", "deflcol") ||
      "",

    // Building Type & Panels
    frameType:
      extracted?.frame ||
      getCoverVal("frame type", "frame") ||
      "",
    roofPanelColor:
      extracted?.roofpanel ||
      getCoverVal("roof panel", "roof panel color", "roofpanel") ||
      "",
    wallPanel:
      extracted?.wall ||
      getCoverVal("wall panel", "wall panel color", "wall") ||
      "",
    additionalNotes:
      extracted?.notes ||
      getCoverVal("notes", "note") ||
      "",
  };
}

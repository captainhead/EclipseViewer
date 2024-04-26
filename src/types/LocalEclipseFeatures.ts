import BesselianElements from "./BesselianElements";
import ShadowOutlineCurve from "./ShadowOutlineCurve";

type LocalEclipseFeatures = {
    besselElements: BesselianElements,
    umbraOutline: ShadowOutlineCurve,
    penumbraOutline: ShadowOutlineCurve,
}

export default LocalEclipseFeatures;
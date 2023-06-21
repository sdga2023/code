import { interpolateLab, piecewise } from 'd3';
import * as Colors from '$lib/styles/tokens.es6.js';

export const PinkRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBasePink200,
  Colors.ColorBasePink300,
  Colors.ColorBasePink400,
  Colors.ColorBasePink500,
  Colors.ColorBasePink600,
  Colors.ColorBasePink700
]);

export const RedRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseRed200,
  Colors.ColorBaseRed300,
  Colors.ColorBaseRed400,
  Colors.ColorBaseRed500,
  Colors.ColorBaseRed600,
  Colors.ColorBaseRed700
]);

export const OrangeRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseOrange200,
  Colors.ColorBaseOrange300,
  Colors.ColorBaseOrange400,
  Colors.ColorBaseOrange500,
  Colors.ColorBaseOrange600,
  Colors.ColorBaseOrange700
]);

export const YellowRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseYellow200,
  Colors.ColorBaseYellow300,
  Colors.ColorBaseYellow400,
  Colors.ColorBaseYellow500
]);

export const GreenRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseGreen300,
  Colors.ColorBaseGreen500,
  Colors.ColorBaseGreen700
]);

export const TealRamp = piecewise(interpolateLab, [
  Colors.ColorBaseTeal100,
  Colors.ColorBaseTeal300,
  Colors.ColorBaseTeal500,
  Colors.ColorBaseTeal700
]);

export const BlueRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseBlue300,
  Colors.ColorBaseBlue500,
  Colors.ColorBaseBlue700
]);

export const PurpleRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBasePurple300,
  Colors.ColorBasePurple500,
  Colors.ColorBasePurple700
]);

export const DivergingNegPos = piecewise(interpolateLab, [
  Colors.ColorBaseRed400,
  Colors.ColorBaseRed300,
  Colors.ColorBaseLightBeige200,
  Colors.ColorBaseBlue300,
  Colors.ColorBaseBlue400
]);

export const MEARamp = piecewise(interpolateLab, [
  Colors.ColorBasePink100,
  Colors.ColorBasePink200,
  Colors.ColorBasePink300,
  Colors.ColorBasePink400,
  Colors.ColorBasePink500,
  Colors.ColorBasePink600
]);

export const LCNRamp = piecewise(interpolateLab, [
  Colors.ColorBaseGreen100,
  Colors.ColorBaseGreen200,
  Colors.ColorBaseGreen300,
  Colors.ColorBaseGreen400,
  Colors.ColorBaseGreen500,
  Colors.ColorBaseGreen600
]);

export const SASRamp = piecewise(interpolateLab, [
  Colors.ColorBaseTeal100,
  Colors.ColorBaseTeal200,
  Colors.ColorBaseTeal300,
  Colors.ColorBaseTeal400,
  Colors.ColorBaseTeal500
]);

export const SSFRamp = piecewise(interpolateLab, [Colors.ColorBaseYellow100, Colors.ColorBaseYellow200, Colors.ColorBaseYellow300]);

export const ECSRamp = piecewise(interpolateLab, [
  Colors.ColorBaseRed100,
  Colors.ColorBaseRed200,
  Colors.ColorBaseRed300,
  Colors.ColorBaseRed400,
  Colors.ColorBaseRed500,
  Colors.ColorBaseRed600
]);

export const NACRamp = piecewise(interpolateLab, [
  Colors.ColorBaseBlue100,
  Colors.ColorBaseBlue200,
  Colors.ColorBaseBlue300,
  Colors.ColorBaseBlue400,
  Colors.ColorBaseBlue500,
  Colors.ColorBaseBlue600
]);

export const EASRamp = piecewise(interpolateLab, [
  Colors.ColorBaseOrange100,
  Colors.ColorBaseOrange200,
  Colors.ColorBaseOrange300,
  Colors.ColorBaseOrange400,
  Colors.ColorBaseOrange500,
  Colors.ColorBaseOrange600
]);
export const WLDRamp = piecewise(interpolateLab, [
  Colors.ColorBaseDarkPurple100,
  Colors.ColorBaseDarkPurple200,
  Colors.ColorBaseDarkPurple300,
  Colors.ColorBaseDarkPurple400,
  Colors.ColorBaseDarkPurple500,
  Colors.ColorBaseDarkPurple600
]);

export const RegionColorMap = {
  WLD: WLDRamp,
  EAS: EASRamp,
  NAC: NACRamp,
  ECS: ECSRamp,
  SSF: SSFRamp,
  SAS: SASRamp,
  LCN: LCNRamp,
  MEA: MEARamp
};

export const GreenTealRamp = piecewise(interpolateLab, [Colors.ColorBaseGreen200, Colors.ColorBaseTeal500, Colors.ColorBasePink800]);

export const YellowTealRamp = piecewise(interpolateLab, [Colors.ColorBaseYellow100, Colors.ColorBaseTeal400, Colors.ColorBaseBlue700]);

export const Ramp = OrangeRamp;

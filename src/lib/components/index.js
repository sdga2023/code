export { default as Banner } from './Banner.svelte';
export { default as BannerTargets } from './BannerTargets.svelte';
export { default as GoalHeadline } from './GoalHeadline.svelte';
export { default as StoryTitle } from './StoryTitle.svelte';
export { default as Image } from './Image.svelte';
export { default as Subheader } from './Subheader.svelte';
export { default as Subheaderer } from './Subheaderer.svelte';
export { default as ChapterFooter } from './ChapterFooter.svelte';
export { default as WideSideBySide } from './WideSideBySide.svelte';
export { default as Scene } from './Scene.svelte';
export { default as TextBlock } from './TextBlock.svelte';
export { default as UnknownComponent } from './UnknownComponent.svelte';
export { default as VisContainer } from './VisContainer.svelte';
export { default as ScatterPlot } from './ScatterPlot.svelte';
export { default as SimpleVis } from './SimpleVis.svelte';
export { default as Navigation } from './Navigation.svelte';
export { default as ReferenceCountrySelector } from './ReferenceCountrySelector.svelte';
export { default as Factoid } from './Factoid.svelte';
export { default as TextEmphasis } from './TextEmphasis.svelte';
export { default as Onwards } from './Onwards.svelte';
export { default as ShareIcons } from './ShareIcons.svelte';
export { default as Supplementary } from './Supplementary.svelte';
export { default as IllustrationGrid } from './IllustrationGrid.svelte';

// general
export { default as CountryPicker } from './general/CountryPicker.svelte';
export { default as Number } from './general/Number.svelte';
export { default as Tooltip } from './general/Tooltip.svelte';
export { default as ChartGrid } from './ChartGrid.svelte';
export { default as CategoricalLegend } from './general/CategoricalLegend.svelte';
export { default as Legend } from './general/Legend.svelte';
export { default as Loading } from './Loading.svelte';

/*
// goal 01
export { default as PovertyLineScroller } from './goal01/PovertyLineScroller.svelte';
export { default as PovertyLineRegionBeeswarm } from './goal01/PovertyLineRegionBeeswarm.svelte';
export { default as RegionBeeswarmScroller } from './goal01/RegionBeeswarmScroller.svelte';
export { default as PovertyClimateScroller } from './goal01/PovertyClimateScroller.svelte';
export { default as EmissionBars } from './goal01/EmissionBars.svelte';
export { default as PovertyProjectionLine } from './goal01/PovertyProjectionLine.svelte';

// goal 02
export { default as MalnutritionTypes } from './goal02/MalnutritionTypes.svelte';
export { default as ICP } from './goal02/ICP.svelte';
export { default as FoodGroupPrices } from './goal02/FoodGroupPrices.svelte';
export { default as TopWheatExporters } from './goal02/TopWheatExporters.svelte';
export { default as UkraineFoodExportTime } from './goal02/UkraineFoodExportTime.svelte';
export { default as UkraineImport } from './goal02/UkraineImport.svelte';
export { default as UkraineImport2 } from './goal02/UkraineImport2.svelte';
export { default as ExportRestrictions } from './goal02/ExportRestrictions.svelte';

// goal 03
export { default as ExcessChart } from './goal03/ExcessChart.svelte';
export { default as ExcessMap } from './goal03/ExcessMap.svelte';
export { default as Globe } from './goal03/Globe.svelte';
export { default as ExcessMortalityTreemap } from './goal03/ExcessMortalityTreemap.svelte';
export { default as CovidVax } from './goal03/CovidVax.svelte';
export { default as TuberculosisDetection } from './goal03/TuberculosisDetection.svelte';
export { default as TuberculosisDeaths } from './goal03/TuberculosisDeaths.svelte';
export { default as TuberculosisScroller } from './goal03/TuberculosisScroller.svelte';
export { default as MalariaScroller } from './goal03/MalariaScroller.svelte';
export { default as MalariaMortality } from './goal03/MalariaMortality.svelte';
export { default as MalariaAgeChart } from './goal03/MalariaAgeChart.svelte';
export { default as ChildhoodImmunizations } from './goal03/ChildhoodImmunizations.svelte';
export { default as DptSlope } from './goal03/DptSlope.svelte';
export { default as TrafficAccidents } from './goal03/TrafficAccidents.svelte';
export { default as ForegoneCare } from './goal03/ForegoneCare.svelte';

// goal 04
export { default as ParallelCoordinatesScroller } from './goal04/ParallelCoordinatesScroller.svelte';
export { default as LearningPlatforms } from './goal04/LearningPlatforms.svelte';
export { default as LearningPovertyScenarios } from './goal04/LearningPovertyScenarios.svelte';
export { default as LearnLossScroller } from './goal04/LearnLossScroller.svelte';
export { default as LearningActivitiesSlopechart } from './goal04/LearningActivitiesSlopechart.svelte';
export { default as LearningActivitiesQuintiles } from './goal04/LearningActivitiesQuintiles.svelte';
export { default as LearningActivitiesScroller } from './goal04/LearningActivitiesScroller.svelte';
export { default as LearningLossesMexico } from './goal04/LearningLossesMexico.svelte';
export { default as DropOutArrows } from './goal04/DropOutArrows.svelte';
export { default as SaoPauloScoresLines } from './goal04/SaoPauloScoresLines.svelte';

// goal 05
export { default as TimeUseGapChart } from './goal05/TimeUseGapChart.svelte';
export { default as StackedBarChart } from './goal05/StackedBarChart.svelte';
export { default as WaterFetchingScroller } from './goal05/WaterFetchingScroller.svelte';
export { default as MarriageScroller } from './goal05/MarriageScroller.svelte';
export { default as DomesticViolenceCartogram } from './goal05/DomesticViolenceCartogram.svelte';

// goal 06
export { default as WaterStress } from './goal06/WaterStress.svelte';
export { default as WaterDistribution } from './goal06/WaterDistribution.svelte';
export { default as WaterWithdrawalBySector } from './goal06/WaterWithdrawalBySector.svelte';
export { default as FreshwaterAmount } from './goal06/FreshwaterAmount.svelte';
export { default as FreshwaterPerCapita } from './goal06/FreshwaterPerCapita.svelte';
export { default as FreshwaterPerCapita2 } from './goal06/FreshwaterPerCapita2.svelte';
export { default as WithdrawalAndPopulation } from './goal06/WithdrawalAndPopulation.svelte';
export { default as CountryCorrelation } from './goal06/CountryCorrelation.svelte';
export { default as WaterMap } from './goal06/WaterMap.svelte';
export { default as LakeMead } from './goal06/LakeMead.svelte';
export { default as WaterWithdrawalTimeseries } from './goal06/WaterWithdrawalTimeseries.svelte';
export { default as LakeMeadSatellite } from './goal06/LakeMeadSatellite.svelte';
export { default as MegaDrought } from './goal06/MegaDrought.svelte';
export { default as SupplyVsUse } from './goal06/SupplyVsUse.svelte';

// goal 07
export { default as AccessElectricityLineChart } from './goal07/AccessElectricityLineChart.svelte';
export { default as ElectricityAccessRegions } from './goal07/ElectricityAccessRegions.svelte';
export { default as ElectricityTiersCountries } from './goal07/ElectricityTiersCountries.svelte';
export { default as ElectricityTiersEthiopia } from './goal07/ElectricityTiersEthiopia.svelte';
export { default as RenewableStackedBars } from './goal07/RenewableStackedBars.svelte';
export { default as ElectricitySourcesStackedAreas } from './goal07/ElectricitySourcesStackedAreas.svelte';
export { default as ElectricitySourcesCountries } from './goal07/ElectricitySourcesCountries.svelte';
export { default as TernaryPlot } from './goal07/TernaryPlot.svelte';
export { default as ElectricityAccessEmissionsConnectedScatter } from './goal07/ElectricityAccessEmissionsConnectedScatter.svelte';
export { default as NightlightsPopulationScroller } from './goal07/NightlightsPopulationScroller.svelte';
export { default as TiersIllustration } from './goal07/TiersIllustration.svelte';

// goal 08
export { default as TourismChart } from './goal08/TourismChart.svelte';
export { default as WorldTileGrid } from './goal08/WorldTileGrid.svelte';
export { default as MultipleBarCharts } from './goal08/MultipleBarCharts.svelte';
export { default as BarChartGDPGrowthWorld } from './goal08/BarChartGDPGrowthWorld.svelte';
export { default as DifferenceChartsRegions } from './goal08/DifferenceChartsRegions.svelte';
export { default as DifferenceChartsCountries } from './goal08/DifferenceChartsCountries.svelte';
export { default as DifferenceChartWorld } from './goal08/DifferenceChartWorld.svelte';
export { default as DifferenceChartSearch } from './goal08/DifferenceChartSearch.svelte';
//export { default as GenderGapLineChart } from './goal08/GenderGapLineChart.svelte';
export { default as GenderGapsUnemployment } from './goal08/GenderGapsUnemployment.svelte';
export { default as SharedProsperityScatter } from './goal08/SharedProsperityScatter.svelte';
export { default as UkraineDifferenceChart } from './goal08/UkraineDifferenceChart.svelte';

// goal 09
export { default as AirTrafficLines } from './goal09/AirTrafficLines.svelte';
export { default as RoadTrafficLines } from './goal09/RoadTrafficLines.svelte';
export { default as ContainerTraffic } from './goal09/ContainerTraffic.svelte';
export { default as VehicleStockLine } from './goal09/VehicleStockLine.svelte';
export { default as RegulationMap } from './goal09/RegulationMap.svelte';
export { default as EVSales } from './goal09/EVSales.svelte';
export { default as BurkinaMap } from './goal09/BurkinaMap.svelte';
export { default as TransportEmissionsScroller } from './goal09/TransportEmissionsScroller.svelte';
export { default as RoadTrafficEmissionScatter } from './goal09/RoadTrafficEmissionScatter.svelte';
export { default as TransportModeEmissions } from './goal09/TransportModeEmissions.svelte';
export { default as UsedVehiclesChordDiagram } from './goal09/UsedVehiclesChordDiagram.svelte';

// goal 10
export { default as GiniWorld } from './goal10/GiniWorld.svelte';
export { default as GiniLinechart } from './goal10/GiniLinechart.svelte';
export { default as GiniExplorerResult } from './goal10/GiniExplorerResult.svelte';
export { default as GiniBeeswarmExplorer } from './goal10/GiniBeeswarmExplorer.svelte';
export { default as GiniSimulation } from './goal10/GiniSimulation.svelte';
export { default as GiniCovidPlot } from './goal10/GiniCovidPlot.svelte';

// goal 12
export { default as GDPScroller } from './goal12/GDPScroller.svelte';

// goal 13
export { default as TemperatureScroller } from './goal13/TemperatureScroller.svelte';
export { default as DisasterStackedArea } from './goal13/DisasterStackedArea.svelte';
export { default as DisasterDamages } from './goal13/DisasterDamages.svelte';
export { default as CountryEmissionProjections } from './goal13/CountryEmissionProjections.svelte';
export { default as VariableWidthBars } from './goal13/VariableWidthBars.svelte';
export { default as GHGSectorsTreemap } from './goal13/GHGSectorsTreemap.svelte';
export { default as TopIncomeEmissions } from './goal13/TopIncomeEmissions.svelte';
export { default as ReadinessVulnerabilityChoro } from './goal13/ReadinessVulnerabilityChoro.svelte';
export { default as CommitmentsStack } from './goal13/CommitmentsStack.svelte';
export { default as AverageExtremeTemperatures } from './goal13/AverageExtremeTemperatures.svelte';

// goal 14
export { default as OverfishingStackedAreas } from './goal14/OverfishingStackedAreas.svelte';
export { default as FishProductionStackedAreasScroller } from './goal14/FishProductionStackedAreasScroller.svelte';
export { default as FishSectorsStackedAreas } from './goal14/FishSectorsStackedAreas.svelte';
export { default as VesselsStackedAreas } from './goal14/VesselsStackedAreas.svelte';
export { default as FishingAreasMap} from './goal14/FishingAreasMap.svelte';

// goal 15
export { default as ForestMapScroller } from './goal15/ForestMapScroller.svelte';
export { default as ForestChoropleth } from './goal15/ForestChoropleth.svelte';
export { default as TreeCoverLossDriversPie } from './goal15/TreeCoverLossDriversPie.svelte';
export { default as TreeCoverLossDriversRegions } from './goal15/TreeCoverLossDriversRegions.svelte';
export { default as RedListSlopes } from './goal15/RedListSlopes.svelte';
export { default as KbaLineChart } from './goal15/KbaLineChart.svelte';
export { default as ForestTypesScroller } from './goal15/ForestTypesScroller.svelte';
export { default as AnimationScroller } from './goal15/AnimationScroller.svelte';
export { default as WildfiresMap } from './goal15/WildfiresMap.svelte';
*/

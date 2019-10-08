import recycable from "~/static/recycable.js"

export const state = () => ({
  clothesStations: recycable.clothes,
  compostStations: recycable.compost,
  trashStations: recycable.trash,
})
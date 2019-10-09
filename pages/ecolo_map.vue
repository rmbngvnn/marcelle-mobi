<template>
  <div id="parkingMapPage">
    <div id="position">
      <l-map id="map" :zoom="13" :center="initialLocation" ref="map">
        <MapboxTile />

        <b-form @submit.prevent="onSubmit" inline style="z-index:468" class="mt-3 fixed-top">
          <div class="search_content">
            <b-input
              placeholder="Rechercher une adresse"
              v-model="searchAddress"
              class="ml-3 searchbox"
            ></b-input>
            <b-button type="submit" style="z-index:468" class="pr-3 text-right loupe">
              <i class="fas fa-search"></i>
            </b-button>
          </div>
        </b-form>


       <l-marker
          v-for="(clotheStation, i) in $store.state.recycable.clothesStations"
          :lat-lng="[clotheStation.Latitude,clotheStation.Longitude]"
          :visible="buttons[2].state"
        >
          <l-popup style="text-align:center;" class="verte">
            <p
              style="font-weight:bold;"
              class="title text-left border-bottom pb-2"
            >{{clotheStation.title.replace("Aire de covoiturage ","")}}</p>
            <p
              class="text-left"
            >{{clotheStation.address.replace("Aire de covoiturage ","")}}</p>
            <p
              class="text-left"
            >{{clotheStation.phone.replace("Aire de covoiturage ","")}}</p>
            <p class="text-left pt-2">
              <i class="fas fa-directions"></i>
              <a :href="googleRoute(clotheStation.address)" target="_blank" class="adress">Itinéraire</a>
            </p>
          </l-popup>
          <l-icon :icon-url="require('~/assets/images/shirt.png')" :icon-size="[30, 30]" :icon-anchor="[15,0]"></l-icon>
        </l-marker>

        <l-marker
          v-for="(compostStation, i) in $store.state.recycable.compostStations"
          :lat-lng="[compostStation.Latitude,compostStation.Longitude]"
          :visible="buttons[0].state"
        >
          <l-popup style="text-align:center" class="verte">
            <p
              style="font-weight:bold;"
              class="title text-left border-bottom pb-2"
            >{{compostStation.title}}</p>
            <p
              class="text-left"
            >{{compostStation.address}}</p>
            <p
              class="text-left"
            >{{compostStation.contact}}</p>
            <p class="text-left pt-2">
              <i class="fas fa-directions"></i>
              <a :href="googleRoute(compostStation.address)" target="_blank" class="adress">Itinéraire</a>
            </p>
          </l-popup>
          <l-icon :icon-url="require('~/assets/images/plant.png')" :icon-size="[30, 30]" :icon-anchor="[15,0]"></l-icon>
        </l-marker>

        <l-marker
          v-for="(trashStation, i) in $store.state.recycable.trashStations"
          :lat-lng="[trashStation.geometry.coordinates[1],trashStation.geometry.coordinates[0]]"
          :visible="buttons[1].state"
        >
          <l-popup style="text-align:center;" class="verte">
            <p
              style="font-weight:bold; "
              class="title text-left border-bottom pb-2"
            >{{trashStation.fields.nom_decheterie}}</p>
            <p
              class="text-left"
            >{{trashStation.fields.adresse_decheterie}}</p>
            <p
             class="text-left"
            >{{trashStation.fields.telephone}}</p>
            <p class="text-left pt-2">
              <i class="fas fa-directions"></i>
              <a :href="googleRoute(trashStation.fields.adresse_decheterie)" target="_blank" class="adress">Itinéraire</a>
            </p>
          </l-popup>
          <l-icon :icon-url="require('~/assets/images/garbage.png')" :icon-size="[30, 30]" :icon-anchor="[15,0]"></l-icon>
        </l-marker>


        <l-marker v-if="markerLatLng" :lat-lng="markerLatLng"></l-marker>
        <Locatecontrol />
      </l-map>
    </div>

    <div class="fixed-bottom mx-3 mb-3" id="filter">
      <b-button-group style="display:flex; justify-content:center">
        <b-button
          v-for="(btn, idx) in buttons"
          :key="idx"
          :pressed.sync="btn.state"
          variant="light"
          size="sm"
          class="select_btn_vert col-4 borderCentral pt-1"
        >
          <img :src="btn.icon" alt class="icon_filterbar" />
          <p class="text_filterbar mb-3">{{ btn.caption }}</p>
        </b-button>
      </b-button-group>

      <div>
        <b-modal
          title="BootstrapVue"
          id="notFound"
          style="display:flex; flex-direction:row; justify-content:center"
          ok-only
        >
          <p
            class="my-4"
            style="text-align:center"
          >Adresse non trouvée dans Marseille Provence Métropole</p>
          <img src="~/assets/images/mpm.png" style="width:100%" alt />
        </b-modal>
      </div>
      
    </div>
  </div>
</template>

<script>
import { LMap, Lmarker } from 'vue2-leaflet'
import Locatecontrol from '~/components/LocateControl'

import MapboxTile from '~/components/MapboxTile.vue'

export default {
  components: {
    LMap,
    Locatecontrol,
    MapboxTile
  },
  data() {
    return {
      initialLocation: [43.295336, 5.373907],
      markerLatLng: null,
      searchAddress: '',
      buttons: [
        {
          caption: 'Compost',
          state: false,
          icon: require('~/assets/images/plant.png')
        },
        {
          caption: 'Déchetterie',
          state: false,
          icon: require('~/assets/images/garbage.png')
        },
        {
          caption: 'Habits',
          state: true,
          icon: require('~/assets/images/shirt.png')
        }
      ]
    }
  },
  methods: {
    flyTo(latLng, zoom) {
      this.$refs.map.mapObject.flyTo(latLng, zoom)
    },
    updateParking(center) {
      const coord = { latitude: center.lat, longitude: center.lng }
      this.$store.dispatch('parkingMap/fetchChargingStations', coord)
    },
    googleRoute(addre) {
      return (
        'https://www.google.com/maps/search/?api=1&query=' + addre
      )
    },
    getMpmAddress(addresses) {
      const coordMpm = this.$store.state.parkingMap.bbox.split(',')
      //coordMpm[0] = minLat
      //coordMpm[1] = minlng
      //coordMpm[2] = maxLat
      //coordMpm[3] = maxLng
      let found = addresses.data.features.find(
        city =>
          city.geometry.coordinates[1] <= coordMpm[2] &&
          city.geometry.coordinates[1] >= coordMpm[0] &&
          city.geometry.coordinates[0] <= coordMpm[3] &&
          city.geometry.coordinates[0] >= coordMpm[1]
      )
      return found || false
    },

    async onSubmit(evt) {
      if (this.searchAddress == '') return
      let coord = await this.$axios.get(
        'https://api-adresse.data.gouv.fr/search/',
        { params: { q: this.searchAddress, limit: 1 } }
      )
      const found = this.getMpmAddress(coord)
      if (!found) return this.$bvModal.show('notFound')

      const lat = found.geometry.coordinates[1]
      const lng = found.geometry.coordinates[0]
      this.markerLatLng = [lat, lng]
      this.flyTo([lat, lng], 18)
    }
  },
  created() {
    this.$store.dispatch('parkingMap/fetchChargingStations', {
      latitude: this.initialLocation[0],
      longitude: this.initialLocation[1]
    })
    this.$store.dispatch('parkingMap/fetchParkingStations', {
      lat: this.initialLocation[0],
      long: this.initialLocation[1]
    })
    this.$store.dispatch('parkingMap/fetchCarPoolStations')
  }
}
</script>

<style lang="scss">
.mt-3 > .form-inline {
  display: inline-block;
}

.verte {
  .title {
    color: rgba(0, 0, 0, 0.8) !important;
    font-size: 24px !important;
    margin-bottom: 0px;
  }
  .address {
    color: #0e5da4 !important;
    font-size: 16px;
    margin-top: 0px;
    font-style: italic;
    text-align: left !important;
  }
  .leaflet-container a {
    color: rgba(0, 0, 0, 0.8) !important;
    font-size: 16px;
    margin-top: 0px;
    font-style: italic;
    text-align: left !important;
    text-decoration: none;
  }
  .far,
  .fas {
    color: #0e5da4;
    width: 17px;
  }
  p {
    font-size: 14px;
  }
  .leaflet-container a {
    color: rgba(0, 0, 0, 0.8) !important;
  }
}

#parkingMapPage {
  height: 100%;
  width: 100%;
  margin: 0;

  .leaflet-left {
    right: 0 !important;
    padding-right: 10px;
    left: unset;
  }

  #position {
    position: relative;
  }

  #map {
    width: 100wh;
    height: 100vh;
  }

  .textFilter {
    font-size: 0.5rem;
    margin-bottom: 0;
  }

  // .leaflet-control-attribution {
  //   display: none;
  // }

  .h_iframe iframe {
    width: 100%;
    height: 100%;
  }
  .h_iframe {
    height: 100%;
    width: 100%;
  }

  // DESIGN FILTER CARD

  .icon_filterbar {
    width: 35px !important;
    height: 35px !important;
    margin-top: 5px;
  }

  .text_filterbar {
    color: rgba(0, 0, 0, 0.7);
    margin-top: 5px;
    margin-bottom: 2px;
  }

  #filter {
    background-color: aliceblue;
    height: 80px;
    border: none;
    border-radius: 10px;
    box-shadow: 5px 5px 5px gray;
    z-index: 469 !important;
  }

  .borderCentral:first-child {
    border-right: 1px solid rgba(182, 181, 181, 0.8) !important;
    border-radius: 10px 0 0 10px;
  }

  .borderCentral:last-child {
    border-left: 1px solid rgba(182, 181, 181, 0.8) !important;
    border-radius: 0 10px 10px 0;
  }

  .select_btn_vert {
    background-color: transparent;
    height: 80px;
    border: transparent;
    outline: none !important;
  }

  .active {
    background-color: rgba(187, 231, 255, 0.38) !important;
    outline: none !important;
    border: 0;
  }

  .fa-search {
    color: #0e5da4;
  }

  .loupe {
    background-color: white;
    border: none;
    border-radius: 0px 10px 10px 0;
    height: 38px;
  }

  .searchbox {
    border: none;
    border-radius: 10px 0 0 10px;
    width: 100%;
    z-index: 468;
    margin-left: 0px !important;
  }

  .search_content {
    border-radius: 10px;
    border: 0.9px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    z-index: 468;
    display: flex;
    margin-left: 70px;
    margin-right: 50px;
    width: 100%;
  }
}

// .leaflet-popup {
//   position: absolute;
//   text-align: center;
//   bottom: 30px !important;
//   left: -120px !important;
// }
</style>


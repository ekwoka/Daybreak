export var queryTime = 1;
export var resultsTime = 1;
export const API_AUTH = "Bearer VZGGFMM2T9K5GX23JCYU4QEV";
export const TEST_QUERY = {
    query: "",
    fields: ["*"],
    textFacets: [
      "option_auto_colour",
      "option_auto_size",
      "system_collections",
      "system_producttype",
      "system_tags"
    ],
    highlightFields: [],
    searchFields: ["title", "description", "collections", "tags"],
    filter: "priorityScore >= 0 AND publishedTimestamp > 0",
    skip: 0,
    count: 2,
    sort: ["bestSellingScore"],
    collection: "X77WPT9TT2FZHRHYD22L1P4P",
    facetCount: 100,
    groupCount: -1,
    typoTolerance: 2,
    textFacetFilters: {
      option_auto_colour: [],
      option_auto_size: [],
      system_collections: ["Bestsellers"],
      system_producttype: [],
      system_tags: []
    },
    numericFacetFilters: {},
    textFacetQuery: null,
    geo: {}
  }

export async function performSearch(query=this.TEST_QUERY) {
    let queryTime = Date.now();
    this.queryTime = queryTime;
    let response = await this.searchRepeat(query);
    if (!response?.query) return console.log("Update Failed");
    if (this.resultsTime > queryTime) return console.log(`Query Expired`);
    this.resultsTime = queryTime;
    return response;
}

export async function searchRepeat(query=this.TEST_QUERY) {
    var retry = true;
    while (retry) {
      response = await this.queryAPI(query).catch((error) => console.log(error));
      if (response != undefined) retry = false;
      if (!response?.query) await sleep(2000);
    }
    return response;
  }

export async function queryAPI(query=this.TEST_QUERY,timeout = 0){
    let response = await fetch(
      "https://7hsb45sprvitftfe3eg1648d-fast.searchtap.net/v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: this.API_AUTH
        },
        body: JSON.stringify(query)
      }
    );
    /* if (!response.ok && timeout <= 5) return this.queryAPI(query,timeout);
    if (!response.ok && timeout > 5) {
      await new Promise((r) => setTimeout(r, 2000));
      return this.queryAPI(query,timeout);
    } */
    if (response.ok) {
      data = await response.json();
      setTimeout(function () {
        Daybreak.stampedUGC();
      }, 1000);

      return data;
    }
}

/* const stuff = {
  async function searchRepeat() {
    this.updateURL();
    var retry = true;
    while (retry) {
      response = await this.searchAPI().catch((error) => console.log(error));
      if (response != undefined) retry = false;

      if (!response?.query)
        console.log("Search Failed. Trying again 2 seconds.");

      if (!response?.query) await sleep(2000);
    }
    return response;
  },
  queryTime: 1,
  resultsTime: 1,
  async function performSearch() {
    let queryTime = Date.now();
    this.queryTime = queryTime;
    let response = await this.searchRepeat();
    if (!response?.query) return console.log("Update Failed");
    if (this.resultsTime > queryTime) return console.log(`Query Expired`);
    this.resultsTime = queryTime;
    this.response = response;
    if (this.resultsTime == this.queryTime) this.searching = false;
  },
  sortOptions: {
    relevance: "",
    "best selling": "bestSellingScore",
    "new to old": "-publishedTimestamp"
  },
  apiAuth: "Bearer VZGGFMM2T9K5GX23JCYU4QEV",
  query: {
    query: "",
    fields: ["*"],
    textFacets: [
      "option_auto_colour",
      "option_auto_size",
      "system_collections",
      "system_producttype",
      "system_tags"
    ],
    highlightFields: [],
    searchFields: ["title", "description", "collections", "tags"],
    filter: "priorityScore >= 0 AND publishedTimestamp > 0",
    skip: 0,
    count: 36,
    sort: [
      "{%- if collection.handle == 'latest-designs' -%}-publishedTimestamp{%- else -%}bestSellingScore{%- endif -%}"
    ],
    collection: "X77WPT9TT2FZHRHYD22L1P4P",
    facetCount: 100,
    groupCount: -1,
    typoTolerance: 1,
    textFacetFilters: {
      option_auto_colour: [],
      option_auto_size: [],
      system_collections: [""],
      system_producttype: [],
      system_tags: []
    },
    numericFacetFilters: {},
    textFacetQuery: null,
    geo: {}
  }
  async function searchAPI(timeout = 0) {
    this.searching = true;

    response = await fetch(
      "https://7hsb45sprvitftfe3eg1648d-fast.searchtap.net/v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: this.apiAuth
        },
        body: JSON.stringify(this.query)
      }
    );
    if (timeout > 0) console.log(`Request Timeout: ${timeout++}`);
    if (!response.ok && timeout <= 5) return this.searchAPI(timeout);
    if (!response.ok && timeout > 5) {
      console.log("Trying again in 2 seconds");
      await new Promise((r) => setTimeout(r, 2000));
      return this.searchAPI();
    }
    if (response.ok) {
      data = await response.json();
      setTimeout(function () {
        Daybreak.stampedUGC();
      }, 1000);

      return data;
    }
  }
}; */

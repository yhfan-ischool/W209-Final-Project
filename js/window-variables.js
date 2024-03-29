window.dataArray = [];
window.connectionCountArray = [];
window.countryLookupTable = {};
window.sliderX = null;
window.sliderPanel = null;
window.dateBrush = null;
window.dateSliderHandle = null;
window.connectionSelectorPanel = null;
window.selectedDate = null;
window.selectedCountry = 'ARE';
window.inclOfficers = true;
window.inclIntermediaries = true;
window.apiEndPoints = {
  'all' : 'edges_all_countries/%selected_date%/',
  'country_code' : 'edges_by_country/%selected_date%/countrycode/%country_code%/incl_officers/%incl_officers%/incl_intermediaries/%incl_intermediaries%/maxrecursions/%max_recursions%/',
  'entity' : 'edges_by_entity/%selected_date%/nodeid/%node_id%/incl_officers/%incl_officers%/incl_intermediaries/%incl_intermediaries%/maxrecursions/%max_recursions%/',
  'officer' : 'edges_by_nonentity/%selected_date%/nodeid/%node_id%/incl_officers/%incl_officers%/incl_intermediaries/%incl_intermediaries%/maxrecursions/%max_recursions%/',
  'intermediary' : 'edges_by_nonentity/%selected_date%/nodeid/%node_id%/incl_officers/%incl_officers%/incl_intermediaries/%incl_intermediaries%/maxrecursions/%max_recursions%/',
  'connections_all': 'connection_counts_by_country/%selected_date%',
  'connections_one_country': 'connection_counts_one_country/%selected_date%/countrycode/%country_code%/',
  'connections_by_date': 'connection_counts_by_date/%selected_date%/'
};

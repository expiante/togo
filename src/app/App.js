import React, { useState, useEffect } from 'react';
import { sortByField, duplicate, filterById, filterBy } from 'shared/utils/helper';
import { Input } from 'shared/components';
import { Map, List } from './components';
import {
  getStorageData,
  setStorageData,
  updateStorageData,
  removeStorageData
} from './actions';
import { mapConfig } from 'config/consts';
import { mockData } from 'config/consts';

const { defaultPosition, defaultZoom } = mapConfig;

const App = () => {
  const [data, setData] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState('');
  const [zoom, setZoom] = useState(defaultZoom);
  const [search, setSearchText] = useState('');
  const [position, setPosition] = useState(defaultPosition);

  const initializeView = () => {
    initializeMap();
    initializePageData();
  };

  const initializeMap = () => {
    const { url, key, ver, libs } = mapConfig;
    const fullURL = `${url}?key=${key}&v=${ver}&libraries=${libs.join(',')}`;
    setMapUrl(fullURL);
  };

  const initializePageData = () => {
    const data = () => getStorageData('data')
    if (!data()) {
      setStorageData(mockData, 'data');
    }
    setData(data());
  };

  const toggleItem = index => {
    const newData = duplicate(data);
    const item = newData[index];
    item.visited = !item.visited;
    updateStorageData(item);
    setData(newData);
  };

  const createOrUpdateItem = item => {
    const storageData = getStorageData('data');
    if (location) {
      const filteredData = storageData.filter(v => v.id !== item.id);
      setStorageData(sortByField([...filteredData, item], 'id'))
    } else {
      setStorageData(sortByField([...storageData, {
        ...position,
        ...item,
        id: storageData.length + 1,
        visited: false,
      }], 'id'))
    }
    filterData();
  };

  const removeItem = item => {
    const filteredData = filterById(duplicate(data), item);
    if (location) {
      const selectedItemInList = filteredData.find(v => v.id === location.id);
      if (!selectedItemInList) {
        setLocation(filteredData[0]);
      }
    }
    removeStorageData(item);
    setData(filteredData);
  };

  const filterData = () => setData(filterBy(getStorageData('data'), search));

  const managePosition = () => {
    let pos = location ? { lat: location.lat, lng: location.lng } : defaultPosition;
    setPosition(pos);
  };

  const changeLocation = (location) => {
    setZoom(location.zoom)
    setLocation(location)
  };

  useEffect(initializeView, []);
  useEffect(managePosition, [location]);
  useEffect(filterData, [search]);

  return (
    <section className='container-fluid'>
      <div className='row'>
        <div className='col-8 p-0 map-container'>
          {mapUrl && (
            <Map
              data={data}
              location={location}
              zoom={zoom}
              googleMapURL={mapUrl}
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `100vh` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              position={position}
              onFormSubmit={createOrUpdateItem}
              onSelectExistingLocation={setLocation}
              onSelectNewLocation={newPos => {
                setLocation(null);
                setPosition(newPos);
              }}
            />
          )}
        </div>
        <div className='col-4 p-0'>
          <div className='bg-white'>
            <div className='card-body border-0 vh-100 d-flex flex-fill flex-column'>
              <div>
                <div className='input-group mb-3'>
                  <Input placeholder='Search...' onChange={setSearchText} />
                </div>
                {location && <b className='text-info mb-3 d-inline-block'>{location.text}</b>}
              </div>
              <div className='flex-fill overflow-auto'>
                <List
                  rows={data}
                  onItemClick={changeLocation}
                  onRemoveItem={removeItem}
                  onToggleItem={toggleItem}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;

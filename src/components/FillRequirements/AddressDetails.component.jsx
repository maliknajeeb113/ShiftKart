import React, { useState, useEffect } from "react";
import DropDown from "../dropDown/dropDown.component";
import { useSelector } from 'react-redux';
import Edit from "../../images/location-edit.svg";
import Data from "../relocate/data.json";
import { useDispatch } from 'react-redux';
import { updateTotalCost, updateRequirements } from '../../redux/actions';
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";

function AddressDetails({progress, packageSel, cft, totalItemCount }) {

  let totalCostRedux = useSelector((state) => state.TotalCostItems);
  const [basePrice, setBasePrice] = useState(useSelector((state)=> state.TotalCostItems.basePrice));
  const [floorCharges, setFloorCharges] = useState(useSelector((state)=> state.TotalCostItems.floorCharges));
  const [totalBox, setTotalBox] = useState(useSelector((state)=> state.TotalCostItems.totalBox));
  const [totalBoxPrice, setTotalBoxPrice] = useState(useSelector((state)=> state.TotalCostItems.totalBoxPrice));
  const [weekend, setWeekend] = useState(useSelector((state)=> state.TotalCostItems.isWeekend));
  const [totalCost, setTotalCost] = useState(0);
  const [totalCostBF, setTotalCostBF] = useState(0);
  const libraries = ['places'];
  const inputRefFrom = React.useRef();
  const inputRefTo = React.useRef();
  const dispatch = useDispatch();
  let AddOnsADDED = useSelector((state) => state.addOnsItems);
  
  useEffect(() => {
    let calculatedTotalPrice = 0;

    for (const itemName in AddOnsADDED) {
      const item = AddOnsADDED[itemName];
      calculatedTotalPrice += item.price * item.count;
    }
    setAddonsPrice(calculatedTotalPrice);
  }, [AddOnsADDED]);
  

  useEffect(() => {
    if (totalCostRedux) {
      setTotalCostBF(totalCostRedux.totalCostBF); 
      setBasePrice(totalCostRedux.basePrice);
      setFloorCharges(totalCostRedux.floorCharges); 
      setTotalBoxPrice(totalCostRedux.totalBoxPrice); 
      setTotalBox(totalCostRedux.totalBox); 
      setWeekend(totalCostRedux.isWeekend); 
    }
  }, [totalCostRedux]);

  const [fromAddress, setFromAddress] = useState(sessionStorage.getItem('fromAddress'));
  const [toAddress, setToAddress] = useState(sessionStorage.getItem('toAddress'));
  const [distance, setDistance] = useState(sessionStorage.getItem('distance'));
  const [disabled, setDisabled] = useState(true);
  const [addonsPrice, setAddonsPrice] = useState('');
  const [surgePrice, setSurgePrice] = useState(0);

  const newTotalCost = addonsPrice + totalCostBF + (packageSel.price ? packageSel.price : 0) + totalBoxPrice;

  useEffect(() => {
    if(weekend) {
      setSurgePrice(Math.round((addonsPrice + totalCostBF + totalBoxPrice) * 0.2));
    } else {
      setSurgePrice(0);
    }
  }, [weekend, newTotalCost]);


  useEffect(() => {
    let totalcostData = {
      "totalItemCount": totalItemCount,
      "cft": cft,
      "addonsPrice": addonsPrice,
      "packaging": packageSel.packageName,
      "packagingPrice": packageSel.price,
      "totalCost": newTotalCost,
      "surgePrice": weekend ? Math.round((addonsPrice + totalCostBF + totalBoxPrice) * 0.2) : 0,
      "surgedTotalCost": weekend ? Math.round((addonsPrice + totalCostBF + totalBoxPrice) * 1.2) : newTotalCost,
    }

    setTotalCost(addonsPrice + totalCostBF + (packageSel.price ? packageSel.price : 0) + totalBoxPrice);
    dispatch(updateTotalCost(totalcostData));

  }, [totalCostBF, addonsPrice, packageSel, cft, newTotalCost, weekend]);

  console.log("totalcost ", totalCostRedux);
  useEffect(() => {
    if(!disabled) {
      calculateDistance();
    }
  }, [fromAddress, toAddress]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleFromPlaceChanged = () => {
    if(!inputRefFrom?.current?.getPlaces()){
      return;
    }
    const [place] = inputRefFrom.current.getPlaces();
    if (place) {
      setFromAddress(place.formatted_address);
    }
  };

  const handleToPlaceChanged = () => {
    if(!inputRefTo?.current?.getPlaces()) return;
    const [place] = inputRefTo.current.getPlaces();
    if (place) {
      setToAddress(place.formatted_address);
    }
  };
  const calculateDistance = () => {
    if (fromAddress && toAddress) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [fromAddress],
          destinations: [toAddress],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            setDistance(response.rows[0].elements[0].distance.text);
            sessionStorage.setItem('fromAddress',fromAddress);
            sessionStorage.setItem('toAddress',toAddress);
            sessionStorage.setItem('distance',response.rows[0].elements[0].distance.text);
            const requirementData = {
              'fromAddress': fromAddress,
              'toAddress': toAddress,
              'distance': response.rows[0].elements[0].distance.text,
            }
            dispatch(updateRequirements(requirementData));
          } else {
            alert("Region Not Supported.");
            setDistance(null); // Unable to calculate distance
          }
        }
      );
    }
  }
  return (
    <div className="requirements-section-2 flex">
    {progress === 'progress' ? ('') : (
      
      <div className="requirements-your-details-wrapper">
        <div className="border-bottom extra-margin">
          <h2>Cost Of Moving</h2>
        </div>
        <div className="cost-details">
            <div className="cost-details-child"> 
              <span>Base Price</span>
              <span>₹{basePrice}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Floor Charges</span>
              <span>₹{floorCharges}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Total Items Added</span>
              <span>{totalItemCount}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Additional Boxes (per Box ₹100)</span>
              <span>{totalBox}</span>
            </div>
            <div className="cost-details-child"> 
              <span>CFT</span>
              <span>{cft}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Add Ons</span>
              <span>₹{addonsPrice}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Weekend Surge</span>
              <span>₹{surgePrice}</span>
            </div>
            <div className="cost-details-child"> 
              <span>Packaging</span>
              <span>₹{packageSel.price}</span>
            </div>
            <div className="cost-details-child cost-line"> 
              <span>Total Cost: </span>
              <span className="highlightcost">₹{totalCost + surgePrice}</span>
            </div>
        </div>
      </div>
    )}
    <div className="requirements-your-details-wrapper">
      <div className="border-bottom extra-margin">
        <h2>Your Details</h2>
      </div>
      <div className="flex space-between requirement-sub-header margin-bottom-10">
        <span>Address</span>
        {progress === 'requirement'  && (
          <img
            src={Edit}
            alt={"Edit-Icon"}
            className="edit-icon"
            onClick={() => {
              setDisabled(!disabled);
            }}
        ></img>
        )}
      </div>
      <div className="relocate-drop-down-container margin-bottom-10">
      {isLoaded && (
          <StandaloneSearchBox 
            onLoad={ref => (inputRefFrom.current = ref)} 
            onPlacesChanged={handleFromPlaceChanged} 
          >
            <input type="text" className="form-control" disabled={disabled || progress !== 'requirement'} placeholder={fromAddress ? fromAddress : 'From Location'}/>
          </StandaloneSearchBox>
        )}
      </div>
      <div className="relocate-drop-down-container">
      {isLoaded && (
          <StandaloneSearchBox 
            onLoad={ref => (inputRefTo.current = ref)} 
            onPlacesChanged={handleToPlaceChanged} 
          >
            <input type="text" className="form-control" disabled={disabled || progress !== 'requirement'} placeholder={toAddress ? toAddress :  'To Location'} />
          </StandaloneSearchBox>
        )}
      </div>
    </div>
  </div>
  );
}

export default AddressDetails;
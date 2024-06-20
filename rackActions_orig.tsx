import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RACKS_URL, EXTERNAL_RACK_FIELDS_URL } from "../../config/urls";
import { getRackTypes } from "./rackTypesActions";
import { toast } from "react-toastify";
import { handleError } from "../../utilities/helper";
import ToastMessage from "../../components/ToastMessage";

// # Interfaces#
export interface RackData {
  rack_id: number;
  rms_rack_code: string;
  erp_rack_code: string;
  map_point_id: number;
  racktype_id: number;
  racktype_data: any;
}

interface EditRackData {
  id: string;
  data: any;
}

// # Axios instance #
const axiosInstance = axios.create({
  baseURL: RACKS_URL,
});

// # Utility functions #
const findRackType = (rackTypeID: number, types: any[]) => {
  const typeData = types.find((item) => item.id === rackTypeID);
  return typeData;
};

// function to bind rack data with type
const transformRackData = (rack: any, types: any[]): RackData => {
  return {
    rack_id: rack.id,
    rms_rack_code: rack.external.RMSDummy,
    erp_rack_code: rack.external.ERPDummy,
    map_point_id: Math.floor(Math.random() * 9 + 1),
    racktype_id: rack.rack_type_id,
    racktype_data: findRackType(rack.rack_type_id, types),
  };
};

// function helps to pass external fields as an object
const transferDataFromForm = (dataFromForm: any): any => {
  const typeIdValue = dataFromForm.typeID;
  const asArray = Object.entries(dataFromForm); // Convert obj to key/value array
  const filteredArray = asArray.filter(
    ([key, value]) => key !== "typeID" && value !== typeIdValue
  ); // filteredArray array without rack type ID
  return Object.fromEntries(filteredArray);
};

// # Async thunks #
export const getRacks = createAsyncThunk(
  "rack/getRacks",
  async ({ page, pageSize }: { page: number; pageSize: number }, thunkAPI) => {
    try {
      const { payload: types } = await thunkAPI.dispatch(getRackTypes());
      const { data: racks } = await axiosInstance.get(``, {
        params: {
          page,
          pageSize,
        },
      });
      console.log("Pagination result:", racks);
      const rackData: RackData[] = racks.data.map((rack: any) =>
        transformRackData(rack, types)
      );
      return {
        data: rackData,
        total: racks.total,
        pages: racks.pages,
      };
    } catch (error) {
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const removeRack = createAsyncThunk(
  "rack/removeRack",
  async (id: string, thunkAPI) => {
    try {
      await axiosInstance.delete(`/${id}`);
      toast.success(<ToastMessage message="Rack removed" />);
      const state = thunkAPI.getState() as any;
      const { currentPage, pageSize } = state.racks;
      thunkAPI.dispatch(getRacks({ page: currentPage, pageSize }));
    } catch (error) {
      thunkAPI.rejectWithValue(error);
      console.log(thunkAPI.rejectWithValue(error));
      console.log(error);
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const createRack = createAsyncThunk(
  "rack/createRack",
  async (dataFromForm: any, thunkAPI) => {
    const typeIdValue = dataFromForm.typeID;
    const filteredObj = transferDataFromForm(dataFromForm);
    console.log(filteredObj);
    try {
      const resp = await axiosInstance.post("", {
        rack_type_id: typeIdValue,
        external: filteredObj,
      });
      console.log(resp);
      const state = thunkAPI.getState() as any;
      const { currentPage, pageSize } = state.racks;
      thunkAPI.dispatch(getRacks({ page: currentPage, pageSize }));
      toast.success(<ToastMessage message="Rack created" />);
    } catch (error) {
      console.log(error);
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const getEditableRack = createAsyncThunk(
  "rack/getEditableRack",
  async (id: string, thunkAPI) => {
    try {
      await thunkAPI.dispatch(getRackTypes());
      await thunkAPI.dispatch(getExternalFields());
      const { data: rack } = await axiosInstance(`/${id}`);
      console.log(rack);
      return rack;
    } catch (error) {
      console.log(error);
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const editRack = createAsyncThunk(
  "rack/editRack",
  async ({ id, data }: EditRackData, thunkAPI) => {
    console.log({ id, data });
    const typeIdValue = data.typeID;
    const filteredObj = transferDataFromForm(data);
    console.log(filteredObj);
    try {
      const resp = await axiosInstance.put(`/${id}`, {
        rack_type_id: typeIdValue,
        external: filteredObj,
      });
      console.log(resp);
      const state = thunkAPI.getState() as any;
      const { currentPage, pageSize } = state.racks;
      thunkAPI.dispatch(getRacks({ page: currentPage, pageSize }));
      toast.success(<ToastMessage message="Rack updated" />);
    } catch (error) {
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const getExternalFields = createAsyncThunk(
  "rack/getExternalFields",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as any;
      const { currentPage, pageSize } = state.racks;
      await thunkAPI.dispatch(getRacks({ page: currentPage, pageSize }));
      // Get list of rack external fields
      const resp = await axios(EXTERNAL_RACK_FIELDS_URL);
      console.log(resp);
      // Filter active fields
      const active = resp.data.sources.filter(
        (item: any) => item.active === true
      );
      console.log(active);
      const list = active.map((item: any) => item.name);
      console.log(list);
      return list;
    } catch (error) {
      console.log(error);
      const errorMessage = handleError(error);
      console.log(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

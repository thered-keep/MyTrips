import axios from "axios";
import { Configuration, DefaultApi } from "./__generated";
import { useMemo } from "react";

export function useApiClient() {
  return useMemo(() => {
    const basePath = "/api";
    const axiosInstance = axios.create();
    const config = new Configuration({ basePath });
    return new DefaultApi(config, basePath, axiosInstance);
  }, []);
}

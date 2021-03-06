import { useCallback, useEffect, useState } from "react";
import { SelectOptionType } from "../helpers";
import AddressServices from "../services/AddressServices";

type TypeAddress = "province" | "district" | "ward";
const useAddressOption = (
  addressType: TypeAddress,
  parentId?: number,
): [SelectOptionType[], () => void] => {
  const [listData, setListData] = useState<SelectOptionType[]>([]);

  const fetchData = useCallback(() => {
    if (!parentId && addressType !== "province") {
      setListData([]);
      return;
    }
    const params: any = {
      address_type: addressType,
    };
    if (addressType !== "province") {
      params.parent_id = parentId;
    }
    AddressServices.getAddress(params).then((res) => {
      const newOptionsList = res.data.map((e: any) => ({
        value: e.id,
        label: e.name,
      }));
      setListData(newOptionsList);
    });
  }, [addressType, parentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [listData, fetchData];
};
export default useAddressOption;

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import cls from "classnames";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import ReactTooltip from "react-tooltip";
import BigNumber from "bignumber.js";
import { useCountUp } from "react-countup";
import Link from "next/link";
import Select from "react-select";
import { toast } from "react-toastify";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "./AddSellItem.module.scss";
import SelectCircleItem from "../../components/SelectCircleItem";
import useAddressOption from "../../hooks/useAddressOption";
import Breadcrumb from "../../components/Shared/Breadcrumb";
import UseReasonSection from "../../components/Shared/UseReasonSection/UseReasonSection";
import OrderServies from "../../services/OrderServies";
import LayoutWrapper from "../../components/Shared/LayoutWrapper";
import SubmitButton from "../../components/Shared/SubmitButton";

type TypeGive = "sell" | "donate";
type TypeReceive = "recycling" | "resend";
type Inputs = {
  type_give: string;
  type_receive: string;
  cloth_num: number;
  address_name: string;
  phone: number;
  city_id: number;
  district_id: number;
  ward_id: number;
  address: string;
  email: string;
  address_type: "apartment" | "company";
};

const AddSellItem: NextPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();
  const cityId = watch("city_id");
  const districtId = watch("district_id");
  const clothNumber = watch("cloth_num");
  const [isHomeAddress, setIsHomeAddress] = useState<boolean>(true);
  const [isLoadingBtn, setIsLoadingBtn] = useState<boolean>(false);
  const [typeGive, setTypeGive] = useState<TypeGive>();
  const [typeReceive, setTypeReceive] = useState<TypeReceive>();
  const [listProvince] = useAddressOption("province", 0);
  const [listDistrict] = useAddressOption("district", cityId);
  const [listWard] = useAddressOption("ward", districtId);
  const countUpRef = React.useRef(null);
  const countUpWaterRef = React.useRef(null);
  const user = useSelector((state: any) => state.user.value);

  const isDisableEmail = useMemo(() => user && user.email, [user]);

  const [co2Saved, waterLiterSave] = useMemo(() => {
    const co2Kg = new BigNumber(clothNumber || 0).times(0.5).toNumber();
    const waterLitter = new BigNumber(clothNumber || 0).times(3.78).toNumber();
    return [co2Kg, waterLitter];
  }, [clothNumber]);

  const onSetTypeGive = useCallback((type: TypeGive) => {
    setTypeGive(type);
    setValue("type_give", type);
  }, []);

  const onSetTypeReceive = useCallback((type: TypeReceive) => {
    setTypeReceive(type);
    setValue("type_receive", type);
  }, []);

  const { update } = useCountUp({
    ref: countUpRef,
    start: 1,
    end: 0,
    duration: 1,
    decimals: 2,
  });

  const { update: updateWater } = useCountUp({
    ref: countUpWaterRef,
    start: 1,
    end: 0,
    duration: 1,
    decimals: 2,
  });

  useEffect(() => {
    if (user) {
      setValue("address_name", user.full_name);
      setValue("email", user.email);
    }
  }, [user]);

  useEffect(() => {
    update(co2Saved);
    updateWater(waterLiterSave);
  }, [co2Saved, update]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const params = {
      ...data,
      address_type: isHomeAddress ? "apartment" : "company",
    };
    setIsLoadingBtn(true);
    const res = await OrderServies.createOrder(params);
    if (res && res.data) {
      setIsLoadingBtn(false);
      toast.success("Th??m order th??nh c??ng!");
      await router.push("/sell-and-donate");
    } else {
      setIsLoadingBtn(false);
      toast.error("???? x???y ra l???i !");
    }
  };

  const wrapperQuestion = (text: string, idTip: string, importantText?: string) => (
    <div className={styles.wrapperQuestion}>
      <svg
        data-tip="hello world"
        width="15"
        height="15"
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
        data-for={idTip}
        className={styles.questionTooltip}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 0.5C2.9625 0.5 0.5 2.9625 0.5 6C0.5 9.0375 2.9625 11.5 6 11.5C9.0375 11.5 11.5 9.0375 11.5 6C11.5 2.9625 9.0375 0.5 6 0.5ZM5.446 4.4675C5.561 4.241 5.646 4.1335 5.7165 4.0775C5.7695 4.0355 5.8415 4 6 4C6.3125 4 6.5 4.235 6.5 4.489C6.5 4.628 6.473 4.697 6.399 4.785C6.2955 4.908 6.104 5.0575 5.725 5.308L5.5 5.456V6.5C5.5 6.63261 5.55268 6.75979 5.64645 6.85355C5.74021 6.94732 5.86739 7 6 7C6.13261 7 6.25979 6.94732 6.35355 6.85355C6.44732 6.75979 6.5 6.63261 6.5 6.5V5.9915C6.771 5.8045 6.9985 5.6255 7.1635 5.4295C7.402 5.1465 7.5 4.8445 7.5 4.489C7.5 3.754 6.9335 3 6 3C5.658 3 5.3555 3.088 5.096 3.2935C4.854 3.485 4.689 3.7485 4.554 4.016C4.52263 4.07473 4.50331 4.13914 4.49716 4.20544C4.49102 4.27175 4.49819 4.33861 4.51824 4.40211C4.53828 4.4656 4.57081 4.52445 4.61391 4.57521C4.65701 4.62596 4.70982 4.6676 4.76923 4.69767C4.82864 4.72774 4.89346 4.74564 4.95988 4.75032C5.0263 4.75501 5.09299 4.74637 5.15603 4.72493C5.21907 4.70349 5.27719 4.66968 5.32699 4.62547C5.37678 4.58126 5.41724 4.52756 5.446 4.4675ZM6.5 8.25C6.5 8.11739 6.44732 7.99021 6.35355 7.89645C6.25979 7.80268 6.13261 7.75 6 7.75C5.86739 7.75 5.74021 7.80268 5.64645 7.89645C5.55268 7.99021 5.5 8.11739 5.5 8.25V8.5C5.5 8.63261 5.55268 8.75979 5.64645 8.85355C5.74021 8.94732 5.86739 9 6 9C6.13261 9 6.25979 8.94732 6.35355 8.85355C6.44732 8.75979 6.5 8.63261 6.5 8.5V8.25Z"
        />
      </svg>
      <ReactTooltip
        id={idTip}
        backgroundColor="#E4E4E4"
        effect="solid"
        type="light"
        place="bottom"
        className={styles.customTooltip}
      >
        <div>
          {text} <span className={styles.importantText}>{importantText}</span>
        </div>
      </ReactTooltip>
    </div>
  );

  return (
    <LayoutWrapper>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.biggerFormWrapper}>
            <Breadcrumb>
              <Link href="/sell-and-donate" passHref>
                B??n/
              </Link>
              <Link href="/sell-and-donate" passHref>
                <span> B??n & T??? Thi???n</span>
              </Link>
            </Breadcrumb>
            <div className={styles.bigWrapper}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.cardWrapper}>
                  <div className={styles.card}>
                    <div className={styles.titleNumber}>01</div>
                    <div className={cls(styles.titleMedium, "mt-10")}>
                      ????? c???a b???n g???i v???i m???c ????ch:
                    </div>
                    <div
                      className={cls(styles.buttonWrapper, "mt-40", {
                        [styles.activeButton]: typeGive === "sell",
                      })}
                    >
                      <button type="button" onClick={() => onSetTypeGive("sell")}>
                        Pass ??i
                      </button>
                      {wrapperQuestion(
                        "Qu???n ??o c???a b???n s??? ???????c pass ??i ????? nh???n ti???n. Kh??ng nh???ng ti???t ki???m th???i gian d???n t??? ????? m?? c??n th??m thu nh???p.",
                        "tip1",
                      )}
                    </div>
                    <div
                      className={cls(styles.buttonWrapper, "mt-20", {
                        [styles.activeButton]: typeGive === "donate",
                      })}
                    >
                      <button onClick={() => onSetTypeGive("donate")} type="button">
                        T???? thi????n
                      </button>
                      {wrapperQuestion(
                        "Qu???n ??o c???a b???n s??? ???????c d??ng v???i m???c ????ch t??? thi???n, tr???c ti???p g???i ?????n nh???ng t??? ch???c t??? thi???n.",
                        "tip2",
                      )}
                    </div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.titleNumber}>02</div>
                    <div className={cls(styles.titleMedium, "mt-10")}>
                      ?????? kh??ng ??a??t ti??u chu????n se?? ????????c
                    </div>
                    <div
                      className={cls(styles.buttonWrapper, "mt-40", {
                        [styles.activeButton]: typeReceive === "recycling",
                      })}
                    >
                      <button onClick={() => onSetTypeReceive("recycling")} type="button">
                        Ta??i ch????
                      </button>
                      {wrapperQuestion(
                        "V???i nh???ng m??n ????? kh??ng qua ki???m duy???t, Passdy s??? gi??p b???n t??i ch??? xanh ho???c quy??n g??p nh???ng b??? qu???n ??o n??y",
                        "tip3",
                        "ho??n to??n mi???n ph??.",
                      )}
                    </div>
                    <div
                      className={cls(styles.buttonWrapper, "mt-20", {
                        [styles.activeButton]: typeReceive === "resend",
                      })}
                    >
                      <button onClick={() => onSetTypeReceive("resend")} type="button">
                        Hoa??n tra??
                      </button>
                      {wrapperQuestion(
                        "Nh???ng m??n ????? kh??ng qua ki???m duy???t s??? ???????c g???i l???i cho b???n v???i m???c ph?? l??",
                        "tip4",
                        "99.000??",
                      )}
                    </div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.titleNumber}>03</div>
                    <div className={cls(styles.titleMedium, "mt-10")}>
                      S???? l??????ng ?????? ba??n g????i Passdy:
                    </div>
                    <div className={cls(styles.inputWrapper, "mt-40")}>
                      <input
                        {...register("cloth_num", { required: true })}
                        className={styles.formInput}
                        inputMode="numeric"
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                      />
                      {errors.cloth_num && (
                        <span className="text-danger">
                          {errors.cloth_num?.type === "required" &&
                            "S??? l?????ng ????? b???n g???i Passdy l?? b???t bu???c."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.centerCardWrapper}>
                  <div className={styles.centerCard}>
                    <div className={styles.imageWrapper}>
                      <Image src="/icons/green-earth.svg" width={86} height={108} />
                    </div>
                    <div className={styles.contentBig}>
                      <div className={cls(styles.titleMedium, "mt-20")}>B???n ???? gi??p gi???m th???i</div>
                      <div className={styles.wrapperSaved}>
                        <div className={cls(styles.smallItemWrapper, "mt-30")}>
                          <div className={styles.itemNumber}>
                            <span ref={countUpRef} />
                            kg
                          </div>
                          <div className={cls(styles.smallText, "mt-20")}>Kh?? th???i CO2</div>
                        </div>
                        <div className={cls(styles.smallItemWrapper, "mt-30")}>
                          <div className={styles.itemNumber}>
                            <span ref={countUpWaterRef} />l
                          </div>
                          <div className={cls(styles.smallText, "mt-20")}>N?????c s???ch</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.formCardWrapper}>
                  <div className={styles.titleNumber}>04</div>
                  <div className={cls(styles.titleMedium)}>Th??ng tin cu??a ba??n</div>
                  <div className={cls(styles.formLine, "mt-40")}>
                    <div className={styles.formItemWrapper}>
                      <div className={styles.titleItemForm}>Ho?? va?? t??n</div>
                      <input
                        {...register("address_name", {
                          required: true,
                          pattern: /^[^*|":<>[\]{}`\\()';@&$]+$/,
                          maxLength: 30,
                        })}
                        placeholder="Name"
                        className={styles.formInput}
                        type="text"
                      />
                      {errors.address_name && (
                        <span className="text-danger">
                          {errors.address_name?.type === "required" && "H??? v?? t??n l?? b???t bu???c."}
                          {errors.address_name?.type === "pattern" &&
                            "H??? t??n c?? ch???a k?? t??? ?????c bi???t!"}
                          {errors.address_name?.type === "maxLength" &&
                            "H??? t??n kh??ng th??? v?????t qu?? 30 k?? t???."}
                        </span>
                      )}
                    </div>
                    <div className={styles.districtWrapper}>
                      <div className={styles.formItemWrapper}>
                        <div className={styles.titleItemForm}>Email</div>
                        <input
                          {...register("email", { required: true, pattern: /\S+@\S+\.\S+/ })}
                          placeholder="Email"
                          disabled={isDisableEmail}
                          className={styles.formInput}
                          type="text"
                        />
                        {errors.phone && (
                          <span className="text-danger">
                            {errors.email?.type === "required" && "Email la?? b????t bu????c!"}
                            {errors.email?.type === "pattern" && "Email kh??ng h????p l????!"}
                          </span>
                        )}
                      </div>
                      <div className={styles.formItemWrapper}>
                        <div className={styles.titleItemForm}>S???? ??i????n thoa??i</div>
                        <input
                          {...register("phone", {
                            required: true,
                            pattern: /^[0-9]*$/,
                            maxLength: 15,
                          })}
                          placeholder="Phone"
                          className={styles.formInput}
                          type="text"
                        />
                        {errors.phone && (
                          <span className="text-danger">
                            {errors.phone?.type === "required" && "S??? ??i???n tho???i l?? b???t bu???c."}
                            {errors.phone?.type === "pattern" &&
                              "S??? ??i???n tho???i kh??ng th??? ch???a k?? t??? ?????c bi???t."}
                            {errors.phone?.type === "maxLength" &&
                              "S??? ??i???n tho???i kh??ng th??? v?????t qu?? 15 k?? t???."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cls(styles.formLine, "mt-40")}>
                    <div className={styles.formItemWrapper}>
                      <div className={styles.titleItemForm}>Tha??nh ph????</div>
                      <Controller
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value, name } }) => (
                          <Select
                            value={listProvince.find((c) => c.value === value)}
                            name={name}
                            options={listProvince}
                            onChange={(selectedOption: any) => {
                              onChange(selectedOption.value);
                            }}
                          />
                        )}
                        name="city_id"
                      />
                      {errors.city_id && (
                        <span className="text-danger">
                          {errors.city_id?.type === "required" && "Th??nh ph??? l?? b???t bu???c."}
                        </span>
                      )}
                    </div>
                    <div className={styles.districtWrapper}>
                      <div>
                        <div className={styles.titleItemForm}>Qu????n</div>
                        <Controller
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { onChange, value, name } }) => (
                            <Select
                              value={listDistrict.find((c) => c.value === value)}
                              name={name}
                              options={listDistrict}
                              onChange={(selectedOption: any) => {
                                onChange(selectedOption.value);
                              }}
                            />
                          )}
                          name="district_id"
                        />
                        {errors.district_id && (
                          <span className="text-danger">
                            {errors.district_id?.type === "required" && "Qu???n l?? b???t bu???c."}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className={styles.titleItemForm}>Ph??????ng</div>
                        <Controller
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { onChange, value, name } }) => (
                            <Select
                              value={listWard.find((c) => c.value === value)}
                              name={name}
                              options={listWard}
                              onChange={(selectedOption: any) => {
                                onChange(selectedOption.value);
                              }}
                            />
                          )}
                          name="ward_id"
                        />
                        {errors.ward_id && (
                          <span className="text-danger">
                            {errors.ward_id?.type === "required" && "Ph?????ng l?? b???t bu???c."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cls("mt-40")}>
                    <div className={styles.formItemWrapper}>
                      <div className={styles.titleItemForm}>??i??a chi?? cu?? th????</div>
                      <textarea
                        {...register("address", {
                          required: true,
                          maxLength: 100,
                        })}
                        rows={4}
                        className={styles.formInput}
                      />
                      {errors.address && (
                        <span className="text-danger">
                          {errors.address?.type === "required" && "?????a ch??? c??? th??? l?? b???t bu???c."}
                          {errors.address?.type === "maxLength" &&
                            "?????a ch??? c??? th??? kh??ng th??? qu?? 100 k?? t???."}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={cls("mt-40", styles.addressWrapper)}>
                    <span>Loa??i ??i??a chi??:</span>
                    <div className={styles.addressTypeWrapper}>
                      <SelectCircleItem
                        onClick={() => setIsHomeAddress(true)}
                        className={styles.mr70}
                        isSelected={isHomeAddress}
                        label="Nha?? ri??ng"
                      />
                      <SelectCircleItem
                        onClick={() => setIsHomeAddress(false)}
                        isSelected={!isHomeAddress}
                        label="N??i la??m vi????c"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.confirmButtonWrapper}>
                  <SubmitButton loading={isLoadingBtn}>X??c nh???n</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <UseReasonSection />
    </LayoutWrapper>
  );
};

export default AddSellItem;

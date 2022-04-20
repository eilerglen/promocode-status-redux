import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { getItemsRequest, applyPromoCodeRequest } from "../../services/fakeApi";
import styles from "./products-container.module.css";
import { Product } from "./product";
import { Input } from "../../UI/input/input";
import { MainButton } from "../../UI/main-button/main-button";
import { PromoButton } from "../../UI/promo-button/promo-button";
import { Loader } from "../../UI/loader/loader";
import { useDispatch, useSelector } from "react-redux";
import { applyPromo, getItems } from "../../services/actions/cart";


export const ProductsContainer = () => {
  const dispatch = useDispatch();
 const { items, promoCode, promoDiscount, promoRequest, promoFailed, itemsRequest } = useSelector(
    state => state.cart
  );
  
  const inputRef = useRef(null);

  useEffect(
    () => {
      dispatch(getItems());
    },
    [dispatch]
  );

  const applyPromoCode = useCallback(
    () => {
      dispatch(applyPromo(inputRef.current.value));
    },
    [inputRef, dispatch]
  );
  
  const content = useMemo(
    () => {
      return itemsRequest ? (
        <Loader size="large" />
      ) : (
        items.map((item, index) => {
          return <Product key={index} {...item} />;
        })
      );
    },
    [itemsRequest, items]
  );

  const promoCodeStatus = useMemo(
    () => {
      return promoFailed ? (
        <p className={styles.text}>Произошла ошибка! Проверьте корректность введенного промокода</p>
      ) : promoRequest ? (
        ''
      ) : promoCode && !!promoDiscount ? (
        <p className={styles.text}>Промокод успешно применён!</p>
      ) : (
        ''
      );
    },
    [promoRequest, promoDiscount, promoCode, promoFailed]
  );

  return (
    <div className={`${styles.container}`}>
      {content}
      <div className={styles.promo}>
        <div className={styles.inputWithBtn}>
          <Input
            type="text"
            placeholder="Введите промокод"
            extraClass={styles.input}
            inputWithBtn={true}
            inputRef={inputRef}
          />
          <MainButton
            type="button"
            extraClass={styles.promo_button}
            inputButton={true}
            onClick={applyPromoCode}
          >
            {promoRequest ? <Loader size="small" inverse={true} /> : 'Применить'}
          </MainButton>
        </div>
        {!!promoCode && !!promoDiscount && <PromoButton extraClass={styles.promocode}>{promoCode}</PromoButton>}
      </div>
      {promoCodeStatus}
    </div>
  );
};
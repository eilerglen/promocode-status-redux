import React, { useCallback, useEffect, useRef, useMemo, useState, useContext } from 'react';
import { getItemsRequest, applyPromoCodeRequest } from '../../services/fakeApi';
import styles from './products-container.module.css';
import { Product } from './product';
import { Input } from '../../UI/input/input';
import { MainButton } from '../../UI/main-button/main-button';
import { PromoButton } from '../../UI/promo-button/promo-button';
import { Loader } from '../../UI/loader/loader';
import { DiscountContext, TotalPriceContext } from '../../services/appContext';
import { DataContext, PromoContext} from '../../services/productsContext'

export const ProductsContainer = () => {

  const { setTotalPrice } = useContext(TotalPriceContext)
  const { discountDispatcher } = useContext(DiscountContext)

  const [data, setData] = useState([]);
  const [promo, setPromo] = useState('');

  const [itemsRequest, setItemsRequest] = useState(false);
  const [promoFailed, setPromoFailed] = useState(false);
  const [promoRequest, setPromoRequest] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    setItemsRequest(true);
    getItemsRequest()
      .then(res => {
        if (res && res.success) {
          setData(res.data);
          setItemsRequest(false);
        }
      })
      .catch(err => {
        console.log(err);
        setItemsRequest(false);
      });
  }, []);

  useEffect(
    () => {
      let total = 0;
      data.map(item => (total += item.price * item.qty));
      setTotalPrice(total);
    },
    [data, setTotalPrice]
  );

  const applyPromoCode = useCallback(
    () => {
      const inputValue = inputRef.current.value;
      setPromoRequest(true);
      applyPromoCodeRequest(inputValue)
        .then(res => {
          if (res && res.success) {
            setPromo(inputValue);
           discountDispatcher({type: 'set', payload: res.discount});
            setPromoRequest(false);
            setPromoFailed(false);
          } else {
            setPromoFailed(true);
            setPromoRequest(false);
            discountDispatcher({type: 'reset'});
            setPromo('');
          }
        })
        .catch(err => {
          console.log(err);
          setPromoRequest(false);
        });
    },
    [discountDispatcher]
  );

  const content = useMemo(
    () => {
      return itemsRequest ? (
        <Loader size="large" />
      ) : (
        data.map((item, index) => {
          return (
            <Product
              key={index}
              {...item}
            />
          );
        })
      );
    },
    [itemsRequest, data]
  );

  const promoCodeStatus = useMemo(
    () => {
      return promoFailed ? (
        <p className={styles.text}>Произошла ошибка! Проверьте корректность введенного промокода</p>
      ) : promoRequest ? (
        ''
      ) : promo ? (
        <p className={styles.text}>Промокод успешно применён!</p>
      ) : (
        ''
      );
    },
    [promoRequest, promo, promoFailed]
  );

  return (
    <div className={`${styles.container}`}>
      <DataContext.Provider value={{ data, setData}}>
        <PromoContext.Provider value = {{promo, setPromo}}>
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
            {promo && (
              <PromoButton extraClass={styles.promocode}>
                {promo}
              </PromoButton>
          )}
          </div>
          {promoCodeStatus}
        </PromoContext.Provider>
      </DataContext.Provider>   
    </div>
  );
};
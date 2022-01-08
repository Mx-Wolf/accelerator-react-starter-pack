import {useFetchMaxPriceQuery, useFetchMinPriceQuery} from '../../../service/api';
import {ChangeEvent, useCallback, useState} from 'react';
import {
  QUERY_MAX_PRICE,
  QUERY_MIN_PRICE,
  StringFilter,
  deleteUncheckedStringCountFilter,
  deleteUncheckedTypeFilter,
  stringifyCheckedStringCountFilters,
  stringifyCheckedTypeFilters,
  isTwelveStringsChecked,
  isTwelveStringsDisabled,
  isSevenStringsDisabled,
  isAcousticChecked,
  isFourStringsDisabled,
  isSevenStringsChecked,
  isSixStringsChecked,
  isSixStringsDisabled,
  isFourStringsChecked,
  isElectricChecked, isUkuleleChecked
} from '../../../const/const';
import {StringCount, Type, ViewState} from '../catalog';
import _ from 'lodash';

type FilterProps = {
  viewState: ViewState;
  changeURL: (updatedViewState: ViewState) => void;
}

let checkedTypeFilters:string[] = [];
let checkedStringCountFilters:string[] = [];

function Filter ({viewState, changeURL}:FilterProps):JSX.Element {
  const [stateType, setStateType] = useState<Type>({acoustic: '', electric: '', ukulele: ''});
  const [stateStringCount, setStateStringCount] = useState<StringCount>({fourStrings: '', sixStrings: '', sevenStrings: '', twelveStrings: ''});
  const [stateMinimumPrice, setStateMinimumPrice] = useState<string | undefined>('');
  const [stateMaximumPrice, setStateMaximumPrice] = useState<string | undefined>('');

  const {data: minPrice} = useFetchMinPriceQuery({type: viewState.type, stringCount: viewState.stringCount});
  const {data: maxPrice} = useFetchMaxPriceQuery({type: viewState.type, stringCount: viewState.stringCount});

  const minCatalogPrice = minPrice && minPrice[0].price.toString();
  const maxCatalogPrice = maxPrice && maxPrice[0].price.toString();

  const deletePriceFromURL = (field:string, value:string) => {
    if (value.length === 0 && field === QUERY_MIN_PRICE) {
      viewState = _.omit(viewState, QUERY_MIN_PRICE);
      return changeURL(viewState);
    }
    else if (value.length === 0 && field === QUERY_MAX_PRICE) {
      viewState = _.omit(viewState, QUERY_MAX_PRICE);
      return changeURL(viewState);
    }
  };

  const replaceMinPrice = () => {
    setStateMinimumPrice(minCatalogPrice);
    return changeURL({...viewState, [QUERY_MIN_PRICE]: minCatalogPrice});
  };

  const replaceMaxPrice = () => {
    setStateMaximumPrice(maxCatalogPrice);
    return changeURL({...viewState, [QUERY_MAX_PRICE]: maxCatalogPrice});
  };

  const debouncedChangeURL = useCallback(
    _.debounce((field: string, value:string) => {
      if (value.length === 0) {
        return deletePriceFromURL(field, value);
      }
      if (Number(value) < Number(minCatalogPrice)) {
        return replaceMinPrice();
      }
      if (Number(value) > Number(maxCatalogPrice)) {
        return replaceMaxPrice();
      }
      changeURL({...viewState, [field]: value});
    }, 1000)
    , [viewState]);

  const addTypeFilter = (name: string) => {
    setStateType({...stateType, [name]: name});
    checkedTypeFilters = [...checkedTypeFilters, name];
    changeURL({...viewState, 'type': stringifyCheckedTypeFilters(checkedTypeFilters)});
  };

  const deleteTypeFilter = (name: string) => {
    setStateType({...stateType, [name]: ''});
    checkedTypeFilters = deleteUncheckedTypeFilter(checkedTypeFilters, name);
    if (checkedTypeFilters.length === 0) {
      viewState = _.omit(viewState, 'type');
      changeURL(viewState);
    } else {
      changeURL({...viewState, 'type': stringifyCheckedTypeFilters(checkedTypeFilters)});
    }
  };

  const addStringCountFilter = (name:string, value: string) => {
    setStateStringCount({...stateStringCount, [name]: value});
    checkedStringCountFilters = [...checkedStringCountFilters, value];
    changeURL({...viewState, 'stringCount': stringifyCheckedStringCountFilters(checkedStringCountFilters)});
  };

  const deleteStringCountFilter = (name: string, value: string) => {
    setStateStringCount({...stateStringCount, [name]: ''});
    checkedStringCountFilters = deleteUncheckedStringCountFilter(checkedStringCountFilters, value);
    if (checkedStringCountFilters.length === 0) {
      viewState = _.omit(viewState, 'stringCount');
      changeURL(viewState);
    } else {
      changeURL({...viewState, 'stringCount': stringifyCheckedStringCountFilters(checkedStringCountFilters)});
    }
  };

  return (
    <form className="catalog-filter">
      <h2 className="title title--bigger catalog-filter__title">Фильтр</h2>
      <fieldset className="catalog-filter__block">
        <legend className="catalog-filter__block-title">Цена, ₽</legend>
        <div className="catalog-filter__price-range">
          <div className="form-input">
            <label className="visually-hidden">Минимальная цена</label>
            <input type="number" placeholder={minCatalogPrice && minCatalogPrice} id="priceMin" name="от"
              value={stateMinimumPrice}
              onChange={({target}:ChangeEvent<HTMLInputElement>) => {
                setStateMinimumPrice(target.value);
                debouncedChangeURL(QUERY_MIN_PRICE, target.value);
              }}
            />
          </div>
          <div className="form-input">
            <label className="visually-hidden">Максимальная цена</label>
            <input type="number" placeholder={maxCatalogPrice && maxCatalogPrice} id="priceMax" name="до"
              value={stateMaximumPrice}
              onChange={({target}:ChangeEvent<HTMLInputElement>) => {
                setStateMaximumPrice(target.value);
                debouncedChangeURL(QUERY_MAX_PRICE, target.value);
              }}
            />
          </div>
        </div>
      </fieldset>
      <fieldset className="catalog-filter__block">
        <legend className="catalog-filter__block-title">Тип гитар</legend>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="acoustic" name="acoustic"
            checked={isAcousticChecked(viewState)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              if (stateType.acoustic?.length === 0) {
                isFourStringsChecked(viewState) && deleteStringCountFilter('fourStrings', StringFilter.FourStrings);
                addTypeFilter(target.name);
              } else {
                deleteTypeFilter(target.name);
              }
            }}
          />
          <label htmlFor="acoustic">Акустические гитары</label>
        </div>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="electric" name="electric"
            checked={isElectricChecked(viewState)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              if (stateType.electric?.length === 0) {
                isTwelveStringsChecked(viewState) && deleteStringCountFilter('twelveStrings', StringFilter.TwelveStrings);
                addTypeFilter(target.name);
              } else {
                deleteTypeFilter(target.name);
              }
            }}
          />
          <label htmlFor="electric">Электрогитары</label>
        </div>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="ukulele" name="ukulele"
            checked={isUkuleleChecked(viewState)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              if (stateType.ukulele?.length === 0) {
                isSixStringsChecked(viewState) && deleteStringCountFilter('sixStrings', StringFilter.SixStrings);
                isSevenStringsChecked(viewState) && deleteStringCountFilter('sevenStrings', StringFilter.SevenStrings);
                isTwelveStringsChecked(viewState) && deleteStringCountFilter('twelveStrings', StringFilter.TwelveStrings);
                addTypeFilter(target.name);
              } else {
                deleteTypeFilter(target.name);
              }
            }}
          />
          <label htmlFor="ukulele">Укулеле</label>
        </div>
      </fieldset>
      <fieldset className="catalog-filter__block">
        <legend className="catalog-filter__block-title">Количество струн</legend>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="4-strings" name="4-strings"
            checked={isFourStringsChecked(viewState)}
            disabled={isFourStringsDisabled(stateType)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              stateStringCount.fourStrings?.length === 0
                ? addStringCountFilter('fourStrings', target.name.charAt(0))
                : deleteStringCountFilter('fourStrings', target.name.charAt(0));
            }}
          />
          <label htmlFor="4-strings">4</label>
        </div>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="6-strings" name="6-strings"
            checked={isSixStringsChecked(viewState)}
            disabled={isSixStringsDisabled(stateType)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              stateStringCount.sixStrings?.length === 0
                ? addStringCountFilter('sixStrings', target.name.charAt(0))
                : deleteStringCountFilter('sixStrings', target.name.charAt(0));
            }}
          />
          <label htmlFor="6-strings">6</label>
        </div>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="7-strings" name="7-strings"
            checked={isSevenStringsChecked(viewState)}
            disabled={isSevenStringsDisabled(stateType)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) => {
              stateStringCount.sevenStrings?.length === 0
                ? addStringCountFilter('sevenStrings', target.name.charAt(0))
                : deleteStringCountFilter('sevenStrings', target.name.charAt(0));
            }}
          />
          <label htmlFor="7-strings">7</label>
        </div>
        <div className="form-checkbox catalog-filter__block-item">
          <input className="visually-hidden" type="checkbox" id="12-strings" name="12-strings"
            checked={isTwelveStringsChecked(viewState)}
            disabled={isTwelveStringsDisabled(stateType)}
            onChange={({target}:ChangeEvent<HTMLInputElement>) =>  {
              stateStringCount.twelveStrings?.length === 0
                ? addStringCountFilter('twelveStrings', target.name.slice(0, 2))
                : deleteStringCountFilter('twelveStrings', target.name.slice(0, 2));
            }}
          />
          <label htmlFor="12-strings">12</label>
        </div>
      </fieldset>
    </form>
  );
}

export default Filter;

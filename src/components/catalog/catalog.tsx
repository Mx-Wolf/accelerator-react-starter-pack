import Filter from './filter/filter';
import Sort from './sort/sort';
import GuitarCardsList from '../guitar-cards-list/guitar-cards-list';
import {useFetchGuitarsListQuery} from '../../service/api';
import {useHistory, useLocation} from 'react-router-dom';
import {INITIAL_GUITARS_COUNT, parseViewState, stringifyViewState} from '../../const/const';

export type Type = {
  acoustic?: string;
  electric?: string;
  ukulele?: string;
}
export type StringCount = {
  fourStrings?: string;
  sixStrings?: string;
  sevenStrings?: string;
  twelveStrings?: string;
}
export type ViewState = {
  sort?: string;
  order?: string;
  type?: string;
  stringCount?: string;
  price_gte?: string;
  price_lte?: string;

}

function Catalog ():JSX.Element {
  const history = useHistory();
  const location = useLocation<string>();
  const urlQueryParams = location.search;
  const viewState:ViewState = parseViewState(urlQueryParams);

  const limit = INITIAL_GUITARS_COUNT;

  const changeURL = (updatedViewState: ViewState) => {
    const newLocation = {...location, pathname:'/guitars', search: stringifyViewState(updatedViewState)};
    history.push(newLocation);
  };

  const {data: guitarsList, isLoading} = useFetchGuitarsListQuery(
    {
      limit,
      sort: viewState.sort,
      order: viewState.order,
      type: viewState.type,
      stringCount: viewState.stringCount,
      minPrice: viewState.price_gte,
      maxPrice: viewState.price_lte,
    });

  return (
    <>
      {isLoading && <h1>Loading...</h1>}
      <div className="catalog">
        <Filter
          viewState={viewState}
          changeURL={changeURL}
        />
        <Sort
          viewState={viewState}
          changeURL={changeURL}
        />
        <GuitarCardsList guitarsList={guitarsList} />
      </div>
    </>
  );
}
export default Catalog;

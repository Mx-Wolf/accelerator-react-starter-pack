import {GuitarsList} from '../../types/guitar';
import GuitarCard from '../guitar-card/guitar-card';
import {
  getInitialPageNumber,
  getPaginationPages,
  INITIAL_GUITARS_COUNT
} from '../../const/const';
import {useEffect, useState} from 'react';
import {ViewState} from '../catalog/catalog';

type GuitarCardsListProps = {
  guitarsList?: {response: GuitarsList, totalCount: number} | undefined;
  viewState: ViewState;
  onChangeURL: (updatedViewState: ViewState) => void;
}

const DEFAULT_PAGES_LIMIT = 3;
const FIRST_PAGE = 1;

function GuitarCardsList({guitarsList, viewState, onChangeURL}:GuitarCardsListProps):JSX.Element {
  const [currentPage, setCurrentPage] = useState<string>(getInitialPageNumber(viewState));
  const [startPage, setStartPage] = useState<number>(FIRST_PAGE);

  const pagesTotalCount = guitarsList && Math.ceil( guitarsList.totalCount / INITIAL_GUITARS_COUNT);

  const paginationPages = pagesTotalCount && getPaginationPages(startPage, pagesTotalCount);

  const changePageHandler = (pageNumber: number) => {
    setCurrentPage(pageNumber.toString());
    onChangeURL({...viewState, page: pageNumber.toString()});
  };

  const nextPageClickHandler = () => {
    setCurrentPage((Number(currentPage) + 1).toString());
    if (Number(currentPage) % DEFAULT_PAGES_LIMIT === 0) {
      setStartPage(Number(currentPage) + 1);
    }
    onChangeURL({...viewState, page: (Number(currentPage) + 1).toString()});
  };

  const prevPageClickHandler = () => {
    setCurrentPage((Number(currentPage) - 1).toString());
    if ((Number(currentPage) - 1) % DEFAULT_PAGES_LIMIT === 0) {
      setStartPage((Number(currentPage) - 1) - DEFAULT_PAGES_LIMIT + 1);
    }
    onChangeURL({...viewState, page: (Number(currentPage) - 1).toString()});
  };

  useEffect(() => {
    if ((guitarsList && guitarsList.response.length === 0) && currentPage !== FIRST_PAGE.toString()) {
      changePageHandler(FIRST_PAGE);
    }
  }, [guitarsList?.response]);

  return (
    <>
      <div className="cards catalog__cards">
        {guitarsList && guitarsList.response.map((guitar) => (<GuitarCard key={guitar.id} guitar={guitar} />))}
      </div>
      <div className="pagination page-content__pagination">
        <ul className="pagination__list">
          <li className={`pagination__page pagination__page--prev ${Number(currentPage) <= FIRST_PAGE ? 'visually-hidden' : ''}`} id="prev">
            <a className="link pagination__page-link" onClick={() => prevPageClickHandler()}>Назад</a>
          </li>
          {paginationPages && paginationPages.map((pageNumber:number) =>  (
            <li key={pageNumber} className={`pagination__page ${pageNumber.toString() === currentPage ? 'pagination__page--active' : ''}`}>
              <a className="link pagination__page-link" onClick={() => changePageHandler(pageNumber)}>{pageNumber}</a>
            </li>
          ),
          )}
          <li className={`pagination__page pagination__page--next ${pagesTotalCount && Number(currentPage) < pagesTotalCount  ? '' : 'visually-hidden'}`} id="next">
            <a className="link pagination__page-link" onClick={() => nextPageClickHandler()}>Далее</a>
          </li>
        </ul>
      </div>
    </>
  );
}

export default GuitarCardsList;

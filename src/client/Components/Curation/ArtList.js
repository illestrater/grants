import React, { useState, useEffect, useRef } from 'react';
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import {
  usePositioner,
  useResizeObserver,
  useContainerPosition,
  MasonryScroller
} from "masonic";
import '@appnest/masonry-layout';

import DecidedBlock from './DecidedBlock';
import { useWindowSize } from "@react-hook/window-size";
import '../../styles.scss';

export default function ArtList({ list, type, undo, blind, contentRef, cols, metrics, user, finalScore }) {
  const [showData, setShowData] = useState([]);

  useEffect(() => {
    if (list) {
      list.forEach(item => {
        item.undo = undo ? () => undo(item.id, type) : undefined;
        item.blind = blind;
        item.type = type;
        item.metrics = metrics;
        item.me = user;
        item.finalScore = finalScore;
      })

      setShowData(list);
    }
  }, [list])

  // useScrollPosition(({ currPos }) => {
  //   if ((currPos.y + 1500 > contentRef.current.offsetHeight)) {
  //     setShowData(list.slice(0, showData.length + 30))
  //   }
  // }, [showData], null, true);

  const containerRef = useRef(null);

  const [windowWidth, windowHeight] = useWindowSize();

  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight
  ]);

  const positioner = usePositioner(
    { width, columnWidth: 300, columnGutter: 20, columnCount: Number(cols) },
    [showData]
  );

  const resizeObserver = useResizeObserver(positioner);

  return (
    <div ref={ containerRef }>
      <MasonryScroller
        positioner={ positioner }
        resizeObserver={ resizeObserver }
        containerRef={ containerRef }
        items={ showData }
        height={ windowHeight }
        offset={ offset }
        overscanBy={ 1 }
        render={ DecidedBlock }
      />
    </div>
  );

  // return (
  //   <div className='cols'>
  //     { (showData) ?
  //       <React.Fragment key={ showData.length }>
  //         <masonry-layout cols={ cols }>
  //           { showData.map((item, index) => {
  //               return (<DecidedBlock key={ index } nft={ item } undo={ undo ? () => undo(item.id, type) : undefined } blind={ blind } type={ type } metrics={ metrics } user={ user } finalScore={ finalScore } />);
  //           }) }
  //         </masonry-layout>
  //       </React.Fragment>
  //       :
  //       <div><em>No submissions to show</em></div>
  //     }
  //   </div>
  // );
}

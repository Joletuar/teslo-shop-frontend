import { FC } from 'react';

import { Slide } from 'react-slideshow-image';

import style from './ProductSlideShow.module.css';
import 'react-slideshow-image/dist/styles.css';

interface Props {
  children?: JSX.Element | JSX.Element[];
  images: string[];
}

export const ProductSlideShow: FC<Props> = ({ images }) => {
  return (
    <Slide easing='ease' duration={7000} indicators>
      {images.map((image) => {
        return (
          <div className={style['each-slide']} key={image}>
            <div
              style={{
                backgroundImage: `url(/${image})`,
                backgroundSize: 'cover',
              }}
            ></div>
          </div>
        );
      })}
    </Slide>
  );
};

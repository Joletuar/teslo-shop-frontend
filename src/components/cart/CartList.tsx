import { FC, useContext } from 'react';
import NextLink from 'next/link';

import { CartContext } from '@/context';

import {
  Box,
  Button,
  CardActionArea,
  CardMedia,
  Grid,
  Link,
  Typography,
} from '@mui/material';

import { ItemCounter } from '../ui';
import { ICartProduct, IOrderItem } from '@/interfaces';

interface Props {
  editable?: boolean;
  products?: IOrderItem[];
}

export const CartList: FC<Props> = ({ editable = true, products }) => {
  let { cart, updatedCartQuantity, deleteCartProduct } =
    useContext(CartContext);

  // Función que se encarga de actualizar la cantidad en lista de productos
  const onNewQuantityValue = (product: ICartProduct, newQuantity: number) => {
    product.quantity = newQuantity;
    updatedCartQuantity(product);
  };

  const onDeleteProductCart = (product: ICartProduct) => {
    deleteCartProduct(product);
  };

  const productsToShow = products || cart;

  return (
    <>
      {productsToShow.map((product) => (
        // Se utiliza container porque va a tener varios elementos iternos

        <Grid container sx={{ mb: 1 }} key={`${product.slug}${product.size}`}>
          {/* Item correspondiente a las images de los productos del carrito */}
          {/* A los Grid "item" siempre se les debe de definir el num. columnas que va a ocupar dentro del Grid */}
          <Grid item xs={3}>
            <NextLink href={`/product/${product.slug}`} passHref legacyBehavior>
              <Link>
                <CardActionArea>
                  <CardMedia
                    image={`/${product.image}`}
                    component='img'
                    sx={{ borderRadius: 2 }}
                  />
                </CardActionArea>
              </Link>
            </NextLink>
          </Grid>

          {/* Item con la información de cada producto */}
          <Grid item xs={7} pl={4}>
            <Box display='flex' flexDirection='column'>
              <Typography variant='body1'>{product.title}</Typography>

              <Typography variant='body1'>
                Talla: <strong>{product.size}</strong>
              </Typography>

              {editable ? (
                <ItemCounter
                  currentValue={product.quantity}
                  updatedValue={(value) =>
                    onNewQuantityValue(product as ICartProduct, value)
                  }
                  maxValue={10}
                />
              ) : (
                <Typography variant='h6'>
                  {product.quantity > 1
                    ? `${product.quantity} productos`
                    : `${product.quantity} producto`}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Item con información del path */}

          <Grid
            item
            xs={2}
            display='flex'
            alignItems='center'
            flexDirection='column'
          >
            <Typography variant='subtitle1'>${product.price} c/u</Typography>

            {editable && (
              <Button
                color='error'
                variant='text'
                onClick={() => onDeleteProductCart(product as ICartProduct)}
              >
                Borrar
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  );
};

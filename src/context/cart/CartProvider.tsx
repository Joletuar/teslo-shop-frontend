import { FC, useEffect, useReducer } from 'react';
import { CartContext, cartReducer } from './';
import { ICartOrder, ICartProduct } from '@/interfaces';

import Cookie from 'js-cookie';

export interface shippignAddress {
    firtsName: string;
    lastName: string;
    address: string;
    address2?: string;
    zip: string;
    city: string;
    country: string;
    phone: string;
}

export interface CartState {
    isLoaded: boolean;
    cart: ICartProduct[];
    order: ICartOrder;
    shippignAddress?: shippignAddress;
}

const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    cart: [],
    order: {
        quantity: 0,
        subtotal: 0,
        impuesto: 0,
        total: 0,
    },
    shippignAddress: undefined,
};

interface Props {
    children?: JSX.Element;
}

export const CartProvider: FC<Props> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);

    // Cargamos la cookies del carrito
    useEffect(() => {
        try {
            // Obtenemos las cookies, si existen las serializamos, sino entonces retornamos un array vacío
            const cookiesProduct = Cookie.get('cart')
                ? JSON.parse(Cookie.get('cart')!)
                : [];

            dispatch({
                type: '[Cart] - LoadCart from cookies | storage',
                payload: cookiesProduct,
            });
        } catch (e) {
            dispatch({
                type: '[Cart] - LoadCart from cookies | storage',
                payload: [],
            });
        }
    }, []);

    // Actualizamos las cookies del carrito cuando se modifique un producto
    useEffect(() => {
        // Verificamos que no esté vacío
        if (!state.cart.length) return;

        // Almacenamos la cookie con el nombre "cart"
        Cookie.set('cart', JSON.stringify(state.cart)); // Lo serializamos porque dentro de las cokkies no se puden almacenar objetos, solo strings
    }, [state.cart]);

    // Modificamos las cantidades de los totales cuando se modifique un producto
    useEffect(() => {
        if (!state.cart.length) return;

        // Obtnemos la cantidad de los productos del carrito
        const quantity = state.cart.reduce(
            (acumulador, currentValue) => acumulador + currentValue.quantity,
            0
        );

        // Obtnemos el subotal
        const subtotal = state.cart.reduce(
            (acumulador, currentValue) =>
                acumulador + currentValue.price * currentValue.quantity,
            0
        );

        // Obtnemos el valor del impuesto del subtotal
        const impuesto =
            subtotal * Number(process.env.NEXT_PUBLIC_TAX_RATE || 0.15);

        // Obtnemos el total
        const total = subtotal + impuesto;

        // Realizamos la accion de actualizar los valores
        dispatch({
            type: '[Cart] - Update order values',
            payload: { quantity, subtotal, impuesto, total },
        });
    }, [state.cart]);

    // Función que carga el shippingAddress de las cookies y las guarda en el contexto
    useEffect(() => {
        if (Cookie.get('firtsName')) {
            const addressCookies = {
                firtsName: Cookie.get('firtsName') || '',
                lastName: Cookie.get('lastName') || '',
                address: Cookie.get('address') || '',
                address2: Cookie.get('address2') || '',
                zip: Cookie.get('zip') || '',
                city: Cookie.get('city') || '',
                country: Cookie.get('country') || '',
                phone: Cookie.get('phone') || '',
            };

            dispatch({
                type: '[Cart] - Load address from cookies',
                payload: addressCookies,
            });
        }
    }, []);

    // Actualizar shippign address
    const updateAddress = (address: shippignAddress) => {
        // Guardamos en las cookies campo por campo, porque no se puede guardar un objeto ya que tira error
        Cookie.set('firtsName', address.firtsName);
        Cookie.set('lastName', address.lastName);
        Cookie.set('address', address.address);
        Cookie.set('address2', address.address2 || '');
        Cookie.set('zip', address.zip);
        Cookie.set('city', address.city);
        Cookie.set('country', address.country);
        Cookie.set('phone', address.phone);
        dispatch({
            type: '[Cart] - Update address from cookies',
            payload: address,
        });
    };

    // Agregar un producto
    const onAddProductCart = (product: ICartProduct) => {
        // Verificamos que exista el productos
        const productInCart = state.cart.some((p) => p._id === product._id);

        // Si no existe lo agregamos
        if (!productInCart)
            return dispatch({
                type: '[Cart] - Add Product',
                payload: [...state.cart, product],
            });

        // Si existe, verificamos si tiene ya la talla agregada
        const productInCartButDifferent = state.cart.some(
            (p) => p._id === product._id && p.size === product.size
        );

        // Si no la tiene la agregamos
        if (!productInCartButDifferent)
            return dispatch({
                type: '[Cart] - Add Product',
                payload: [...state.cart, product],
            });

        // Actualizamos el quantity del producto si existe ya una talla que coincida
        const updatedProduct = state.cart.map((p) => {
            if (!(p._id === product._id)) return p;
            if (!(p.size === product.size)) return p; // Acumulamos la cantidad

            p.quantity += product.quantity;
            return p;
        });

        dispatch({
            type: '[Cart] - Add Product',
            payload: [...updatedProduct],
        });
    };

    // Actualizar los totales de las cantidades
    const updatedCartQuantity = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Change cart quantity', payload: product });
    };

    // Eliminar un producto del carrito
    const deleteCartProduct = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Remove cart product', payload: product });
    };

    return (
        <CartContext.Provider
            value={{
                ...state,

                // Métodos
                onAddProductCart,
                updatedCartQuantity,
                deleteCartProduct,
                updateAddress,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
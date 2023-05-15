import { tesloApi } from '@/api';
import { AdminLayout } from '@/components/layouts';
import { AuthContext } from '@/context';
import { IOrder } from '@/interfaces';
import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { Chip, Grid } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useContext } from 'react';

import useSWR from 'swr';

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'Order ID',
        width: 250,
    },
    {
        field: 'email',
        headerName: 'Correo',
        width: 250,
    },
    {
        field: 'name',
        headerName: 'Nombre Completo',
        width: 300,
    },
    {
        field: 'total',
        headerName: 'Monto total',
        width: 300,
    },
    {
        field: 'noProducts',
        headerName: 'Número de Productos',
        width: 250,
        align: 'center', // Propiedad que nos permite alinear el valor dentro de la celda
    },
    {
        field: 'check',
        headerName: 'Ver Orden',
        renderCell: ({ row }: GridRenderCellParams) => {
            return (
                <a
                    href={`/admin/order/${row.id}`}
                    target='_blank'
                    rel='noreferrer'
                >
                    Ver Orden
                </a>
            );
        },
    },
    {
        field: 'isPaid',
        headerName: 'Pagada',
        renderCell: ({ row }: GridRenderCellParams) => {
            return row.isPaid ? (
                <Chip variant='outlined' label='Pagada' color='success' />
            ) : (
                <Chip variant='outlined' label='Pagada' color='error' />
            );
        },
    },
    {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        width: 250,
    },
];

const fetchWithToken = ([url, token]: [string, string]) =>
    tesloApi
        .get(url, { headers: { 'x-token': token } })
        .then((res) => res.data);

const orders = () => {
    const { user } = useContext(AuthContext);

    const { data, error } = useSWR<{ ok: boolean; orders: IOrder[] }>(
        ['http://localhost:3452/api/admin/orders', user?.token], // Parámetros que serán pasados el fetcher, deben ser en forma de lista
        fetchWithToken // función que hará el fetch a la api
    );

    if (!data && !error) return <></>;

    const rows = data!.orders.map((order) => ({
        id: order._id,
        email: user?.email,
        isPaid: order.isPaid,
        name: user?.name,
        total: order.total,
        noProducts: order.numberOfItems,
        createdAt: order.createdAt,
    }));

    return (
        <AdminLayout
            title='Ordenes'
            subTitle='Mantenimiento de ordenes'
            icon={<ConfirmationNumberOutlined />}
        >
            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    {/* Este componente siempre necesita las columnas y rows
                    pagesize: indica el numero de elementos por página */}

                    <DataGrid columns={columns} rows={rows} />
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export default orders;

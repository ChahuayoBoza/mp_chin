import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL,  IZIPAY_URL, IZIPAY_VALIDATE_URL, ALERT_URL, UPLOAD_URL } from '../constants';


const server = "https://mp-chin.onrender.com";
export const orderApiSlice = apiSlice.injectEndpoints({
  
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: { ...order },
      }),
    }),
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: {...details},
      }),
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getIzipayToken: builder.mutation({
      query: (paymentDetails) => ({
        url: IZIPAY_URL,
        method: 'POST',
        body: { ...paymentDetails },
      }),
      transformResponse: response => response, 
    }),
    validateOrder: builder.mutation({
      query: (data) => ({
        url: IZIPAY_VALIDATE_URL,
        method: 'POST',
        body: {
          ...data
        },
      }),
      transformResponse: response => response, 
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),
    uploadEvidenceImage: builder.mutation({
      query: (data) => ({
          url: `${UPLOAD_URL}`,
          method: 'POST',
          body: data,
      }),
    }),

  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetIzipayTokenMutation,
  useValidateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useUploadEvidenceImageMutation,
} = orderApiSlice;

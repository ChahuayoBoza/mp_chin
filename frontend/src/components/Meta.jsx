import { Helmet } from 'react-helmet-async';

const Meta = (
  { 
    title = 'Bienvenido a Chin!!!',
    description = 'Tenemos los mejores productos a bajos precios',
    keywords = 'Electronicos, Ropas, Barato'
  }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  );
};

export default Meta;

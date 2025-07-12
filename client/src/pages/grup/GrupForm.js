import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addGrup, getGrupById, updateGrup, clearCurrentGrup, clearGrupError } from '../../redux/grup/grupSlice';
import CustomForm from '../../components/common/CustomForm';

const GrupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { grup, loading, error } = useSelector((state) => state.grup);
  const [localError, setLocalError] = useState(null);

  const [formData, setFormData] = useState({
    grupAdi: '',
    isActive: true
  });


  useEffect(() => {
    setLocalError(null); // Her açılışta local hata temizlensin
    dispatch(clearGrupError()); // Redux error da temizlensin
    if (id) {
      dispatch(getGrupById(id));
    } else {
      dispatch(clearCurrentGrup());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (grup) {
      setFormData({
        grupAdi: grup.grupAdi || '',
        isActive: grup.isActive !== undefined ? grup.isActive : true
      });
    }
  }, [grup]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearGrupError());
    let result;
    if (id) {
      result = await dispatch(updateGrup({ id, grupData: formData }));
    } else {
      result = await dispatch(addGrup(formData));
    }
    // Hata kontrolü: Eğer hata varsa sadece hata mesajı göster, başka hiçbir aksiyon alma
    if (result.error || result.payload?.error || result.payload?.msg) {
      setLocalError(result.payload?.msg || result.error?.message || 'Bir hata oluştu');
      return;
    }
    // Hata yoksa, başarılıysa navigate et ve hata state'ini temizle
    dispatch(clearGrupError());
    navigate('/gruplar');
  };

  const formFields = [
    {
      name: 'grupAdi',
      label: 'Grup Adı',
      required: true
    },
    {
      name: 'isActive',
      label: 'Aktif',
      type: 'switch'
    }
  ];

  const handleBack = () => {
    setLocalError(null);
    dispatch(clearGrupError());
    navigate('/gruplar');
  };

  return (
    <CustomForm
      title={id ? 'Grup Düzenle' : 'Yeni Grup Ekle'}
      fields={formFields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={localError || error?.msg}
      onBack={handleBack}
      submitText={id ? 'Güncelle' : 'Ekle'}
    />
  );
};

export default GrupForm;
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const CustomForm = ({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  loading,
  error,
  onBack,
  submitText = 'Kaydet'
}) => {
  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      required = false,
      options,
      multiline = false,
      rows = 1,
      fullWidth = true,
      disabled = false,
      shrink = false
    } = field;

    const commonProps = {
      name,
      label,
      value: values[name] || '',
      onChange,
      required,
      fullWidth,
      disabled,
      margin: "normal",
      variant: "outlined",
      InputLabelProps: shrink ? { shrink: true } : undefined
    };

    if (type === 'select' && options) {
      return (
        <TextField
          {...commonProps}
          select
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (type === 'switch') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={values[name] || false}
              onChange={onChange}
              name={name}
              color="primary"
            />
          }
          label={label}
        />
      );
    }

    if (type === 'date') {
      return (
        <TextField
          {...commonProps}
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    return (
      <TextField
        {...commonProps}
        type={type}
        multiline={multiline}
        rows={rows}
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} color="primary" size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {fields.map((field, index) => (
              <Grid item xs={12} sm={field.halfWidth ? 6 : 12} key={index}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Kaydediliyor...' : submitText}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onBack}
            >
              İptal
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CustomForm;
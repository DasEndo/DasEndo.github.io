import { createApplication } from './application.js';
import './styles/theme.css';

const { app } = await createApplication();
app.mount('#app');

// Edit Course Screen - Wrapper around AddCourseScreen

import React from 'react';
import AddCourseScreen from './AddCourseScreen';

const EditCourseScreen = ({ navigation, route }) => {
  // EditCourseScreen just renders AddCourseScreen with the course prop
  // The AddCourseScreen handles both add and edit modes
  return <AddCourseScreen navigation={navigation} route={route} />;
};

export default EditCourseScreen;

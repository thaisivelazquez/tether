import { useRouter } from 'expo-router';
import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Edit from '../../../components/myprofile/editbutton.svg';
import Pfp from '../../../components/myprofile/pfp.svg';
import { styles } from '../../../components/myprofile/profilestyles';

function Profile() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={() => router.push('/myprofile/edit')}
        style={styles.editButton}
      >
        <Edit style={styles.edit} />
      </TouchableOpacity>

      <View style={styles.pfpWrapper}>
        <Pfp style={styles.pfp} />
      </View>

      <View style={styles.nameWrapper}>
        <Text style={styles.name}>
          *place name here*
        </Text>
      </View>

    </View>
  );
}

export default Profile;
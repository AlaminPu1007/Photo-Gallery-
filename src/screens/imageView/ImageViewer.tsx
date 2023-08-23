import {
    ActivityIndicator,
    Dimensions,
    Image,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/stackNavigation/RootStackNav';
// Import RNFetchBlob for the file download
import RNFetchBlob from 'rn-fetch-blob';
import colors from '../../theme/colors';
import commonStyles from '../../styles/commonStyles';

// get scree Dimensions
const HEIGHT = Dimensions.get('screen').height;
type Props = NativeStackScreenProps<RootStackParamList, 'imagePreview'>;

// define type for router
interface routerParams {
    itemId: string | undefined;
    imageUrl: string | undefined;
}

const ImageViewer = ({route}: Props) => {
    // First, assert the correct type for route.params
    const params: routerParams | undefined = route.params;
    const {itemId = '', imageUrl = ''} = params ?? {};

    const [imageLoader, setImageLoader] = useState<boolean>(true);

    // This method will help us to detect if image loaded successfully
    const onLoadOfImage = () => {
        if (imageLoader) {
            setImageLoader(prv => !prv);
        }
    };

    const downLoadImg = async () => {
        // Function to check the platform
        // If iOS then start downloading
        // If Android then ask for permission

        if (Platform.OS === 'ios') {
            downloadImage();
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message:
                            'App needs access to your storage to download Photos',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Once user grant the permission start downloading
                    console.log('Storage Permission Granted.');
                    downloadImage();
                } else {
                    // If permission denied then show alert
                    alert('Storage Permission Not Granted');
                }
            } catch (err) {
                // To handle permission related exception
                console.warn(err);
            }
        }
    };

    const downloadImage = () => {
        // Main function to download the image

        // To add the time suffix in filename
        let date = new Date();
        // Image URL which we want to download
        let image_URL = imageUrl;
        // Getting the extention of the file
        let ext = `${new Date()}`;
        ext = '.jpg';
        // Get config and fs from RNFetchBlob
        // config: To pass the downloading related options
        // fs: Directory path where we want our image to download
        const {config, fs} = RNFetchBlob;
        let PictureDir = fs.dirs.PictureDir;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                // Related to the Android only
                useDownloadManager: true,
                notification: true,
                path:
                    PictureDir +
                    '/image_' +
                    Math.floor(date.getTime() + date.getSeconds() / 2) +
                    ext,
                description: 'Image',
            },
        };
        config(options)
            .fetch('GET', image_URL)
            .then(res => {
                alert('Image Downloaded Successfully.');
            });
    };

    return (
        <View style={[styles.container]}>
            <View
                style={[
                    styles.imageWidget,
                    imageLoader ? styles.imgIsLoading : null,
                ]}>
                {/* @ts-ignore */}
                {imageUrl && (
                    <Image
                        source={{
                            // @ts-ignore
                            uri: imageUrl,
                        }}
                        style={styles.imageContainer}
                        onLoad={onLoadOfImage}
                    />
                )}
            </View>
            {imageLoader ? (
                <View style={[styles.imageWidget, styles.loaderWidget]}>
                    <ActivityIndicator size={'large'} />
                </View>
            ) : null}
            <TouchableOpacity
                activeOpacity={0.4}
                onPress={downLoadImg}
                style={[styles.downloadBtn]}>
                <Text style={[commonStyles.mediumTextStyles, styles.txtStyle]}>
                    Download
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ImageViewer;

const styles = StyleSheet.create({
    container: {
        padding: 0,
        margin: 5,
    },
    firstItemStyles: {
        marginTop: 15,
    },
    imageWidget: {
        width: '100%',
        height: HEIGHT * 0.7,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: HEIGHT * 0.7,
        objectFit: 'contain',
        borderRadius: 4,
    },
    imgIsLoading: {
        width: 0,
        height: 0,
    },
    loaderWidget: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadBtn: {
        width: '100%',
        paddingVertical: 20,
        backgroundColor: colors.primary,
        marginVertical: 10,
    },
    txtStyle: {
        color: colors.white,
        textAlign: 'center',
    },
});

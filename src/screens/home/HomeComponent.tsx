import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    VirtualizedList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Api from '../../api/Api';
//@ts-ignore
import {Access_Key} from '@env';
import {SafeAreaView} from 'react-native-safe-area-context';
import ListOfImage from './homeComponent/ListOfImage';
import commonStyles from '../../styles/commonStyles';
import {generateUUID} from '../../utils/ReusableMethod';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeComponent = () => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [pageNo, setPageNo] = useState<number>(1);

    useEffect(() => {
        let unmount = false;
        if (!unmount) {
            // made api request
            getImageList(1);

            // mark initial loader as a false
            setTimeout(() => {
                setLoading(prv => !prv);
            }, 600);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // const clear = async () => await AsyncStorage.clear();

    /**
     * description :- this method will return images from api
     * @return {image-list}
     * @author {ALAMIN}
     * @created_by :- {ALAMIN}
     * @created_at :- 23/08/2023 20:56:20
     */
    const getImageList = async (page_no: number) => {
        try {
            /** THIS PORTION FOR CACHING PURPOSES */
            const localData = await AsyncStorage.getItem('@my-images');

            if (localData != null && page_no <= JSON.parse(localData)?.pageNo) {
                // destruct property from local-storage
                const LOCAL_DATA = JSON.parse(localData);

                // update local-storage
                setData(LOCAL_DATA?.data || []);
                setPageNo(LOCAL_DATA?.pageNo);
            } else {
                const res = await Api.get('/photos/', {
                    params: {
                        client_id: Access_Key,
                        per_page: 10,
                        page: page_no,
                    },
                });

                if (res?.data?.length) {
                    if (page_no === 1) {
                        // If it's the first page, set the data directly
                        setData(res.data);

                        // store into local storages for caching purposes
                        const item = {
                            data: res.data,
                            pageNo: page_no,
                        };
                        await AsyncStorage.setItem(
                            '@my-images',
                            JSON.stringify(item),
                        );
                    } else {
                        // If it's not the first page, concatenate the new data
                        // @ts-ignore
                        setData(prevData => [...prevData, ...res.data]);

                        // store into local storages for caching purposes

                        const copyItem = [...data, ...res.data];
                        const item = {
                            data: copyItem,
                            pageNo: page_no,
                        };
                        await AsyncStorage.setItem(
                            '@my-images',
                            JSON.stringify(item),
                        );
                    }
                }
            }
        } catch (err) {
            if (__DEV__) {
                console.log(err);
            }
        }
    };

    if (loading) {
        return (
            <View style={[styles.loaderWidget]}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }

    // For infinity scroll
    const onEndMethod = () => {
        // mark an api request with an offset
        const curPage = pageNo + 1;
        getImageList(curPage);
        setPageNo(prv => prv + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            {data?.length ? (
                <>
                    <VirtualizedList
                        data={data}
                        renderItem={({item, index}) => (
                            // @ts-ignore
                            <ListOfImage item={item} index={index} />
                        )}
                        // @ts-ignore,
                        // we put custom uuid cause, the api response has duplicate id,
                        keyExtractor={item => item.id + generateUUID()}
                        getItemCount={data => data.length} // Provide the number of items in your data
                        getItem={(data, index) => data[index]} // Provide the item for a given index
                        showsHorizontalScrollIndicator={false}
                        onEndReachedThreshold={2} // Example threshold value, adjust as needed
                        onEndReached={onEndMethod}
                    />
                </>
            ) : (
                <View style={[commonStyles.pageContentCenter]}>
                    <Text style={[commonStyles.mediumTextStyles]}>
                        Content is not available
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default HomeComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loaderWidget: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

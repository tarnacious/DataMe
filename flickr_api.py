# -*- coding: utf-8 -*-

from __future__ import unicode_literals
from datetime import datetime
from pprint import pprint
from time import mktime

import flickrapi

API_KEY = '69ddc8c585b4d7882cf3af045804dcc4'
SECRET = '12402d0b88aad721'

PHOTO_URL_TEMPLATE = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}.jpg'


def to_timestamp(dt):
    try:
        return mktime(dt.timetuple())
    except AttributeError:
        return dt


def connect(api_key):
    return flickrapi.FlickrAPI(api_key)


def find_photos(api_client, from_time, to_time, lat, lon, radius=5):
    from_time = to_timestamp(from_time)
    to_time = to_timestamp(to_time)
    photos = api_client.photos_search(min_take_ndate=from_time,
                                      max_taken_date=to_time, lat=lat,
                                      lon=lon, radius=radius,
                                      content_type=1, accuracy=1)
    return [resolve_photo_url(photo.attrib)
            for photo in photos.find('photos').findall('photo')]


def resolve_photo_url(photo):
    return PHOTO_URL_TEMPLATE.format(**photo)


if __name__ == '__main__':
    api_client = connect(API_KEY)
    from_time = datetime(2013, 1, 1)
    to_time = datetime.utcnow()
    lat = 52
    lon = 13
    pprint(find_photos(api_client, from_time, to_time, lat, lon))

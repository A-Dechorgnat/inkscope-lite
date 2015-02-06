# Launching ceph-rest-api with Apache
# author Alain Dechorgnat
# inspired by Wido den Hollander wsgi script
# https://gist.github.com/wido/8bf032e5f482bfef949c

import json
import ceph_rest_api
import os, sys

# change dir for inkscope-lite folder
abspath = os.path.dirname(__file__)
sys.path.append(abspath)
os.chdir(abspath)

ceph_config_file="/home/arid6405/dev/microCeph/ceph.conf"
ceph_cluster_name="ceph"
ceph_client_name=None
ceph_client_id="restapi"
args=None

application = ceph_rest_api.generate_app(ceph_config_file, ceph_cluster_name, ceph_client_name, ceph_client_id, args)
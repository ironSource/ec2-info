# Rant

Took some time to understand the logic of ec2 metadata http interface. 

All and all this was a very very frustrating experience, mostly because things like this can happen:

```
[ec2-user@ip-x-x-x-x ~]$ curl http://169.254.169.254/2016-09-02/meta-data/instance-action
none
[ec2-user@ip-x-x-x-x ~]$ curl http://169.254.169.254/2016-09-02/meta-data/instance-action/none
none
[ec2-user@ip-x-x-x-x ~]$ curl http://169.254.169.254/2016-09-02/meta-data/instance-action/none/none
none
```

or

```
[ec2-user@ip-x-x-x-x ~]$ curl http://169.254.169.254/2016-09-02/meta-data/security-groups
sec-group1
default
[ec2-user@ip-x-x-x-x ~]$ curl http://169.254.169.254/2016-09-02/meta-data/security-groups/default
sec-group1
default
```

There is no discernible way to separate `directories` from `values`. Even worse, `directories` and multi line `values` are virtually the same.
The only trick that works (with some extra ifs) is to compare the response from one request to the last one, if they are the same, you ran into a value.
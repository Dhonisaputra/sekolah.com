/*
SQLyog Professional v12.4.1 (64 bit)
MySQL - 10.1.25-MariaDB : Database - sekolah
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `daftar_kelas` */

DROP TABLE IF EXISTS `daftar_kelas`;

CREATE TABLE `daftar_kelas` (
  `kode_daftar_kelas` int(50) NOT NULL AUTO_INCREMENT,
  `jenjang` enum('7','8','9') NOT NULL,
  `alias_kelas` varchar(100) NOT NULL,
  PRIMARY KEY (`kode_daftar_kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `daftar_kelas` */

/*Table structure for table `guru` */

DROP TABLE IF EXISTS `guru`;

CREATE TABLE `guru` (
  `id_guru` int(11) NOT NULL,
  `nama_guru` varchar(200) NOT NULL,
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id_guru`,`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `guru` */

/*Table structure for table `jadwal_kbm` */

DROP TABLE IF EXISTS `jadwal_kbm`;

CREATE TABLE `jadwal_kbm` (
  `kj_kbm` int(11) NOT NULL AUTO_INCREMENT,
  `id_kelas` int(11) NOT NULL,
  `id_pengampu` int(11) NOT NULL,
  `masa_kbm` int(11) NOT NULL,
  `hari` int(11) NOT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`kj_kbm`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `jadwal_kbm` */

/*Table structure for table `jenis_mapel` */

DROP TABLE IF EXISTS `jenis_mapel`;

CREATE TABLE `jenis_mapel` (
  `id_jenis_mapel` int(11) NOT NULL AUTO_INCREMENT,
  `nama_jenis_mapel` varchar(200) NOT NULL,
  PRIMARY KEY (`id_jenis_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `jenis_mapel` */

/*Table structure for table `jurnal_kbm` */

DROP TABLE IF EXISTS `jurnal_kbm`;

CREATE TABLE `jurnal_kbm` (
  `kj_kbm` int(11) NOT NULL,
  `chapter` varchar(200) NOT NULL,
  `catatan` mediumtext NOT NULL,
  PRIMARY KEY (`kj_kbm`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `jurnal_kbm` */

/*Table structure for table `kelas` */

DROP TABLE IF EXISTS `kelas`;

CREATE TABLE `kelas` (
  `id_kelas` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kelas` varchar(100) NOT NULL,
  `kode_daftar_kelas` varchar(10) NOT NULL,
  `tahun_ajaran` year(4) NOT NULL,
  PRIMARY KEY (`id_kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `kelas` */

/*Table structure for table `kelas_siswa` */

DROP TABLE IF EXISTS `kelas_siswa`;

CREATE TABLE `kelas_siswa` (
  `id_kelas` int(11) NOT NULL,
  `nis` int(11) NOT NULL,
  PRIMARY KEY (`id_kelas`,`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `kelas_siswa` */

/*Table structure for table `mapel` */

DROP TABLE IF EXISTS `mapel`;

CREATE TABLE `mapel` (
  `id_mapel` int(11) NOT NULL AUTO_INCREMENT,
  `nama_mapel` varchar(200) NOT NULL,
  `id_jenis_mapel` int(11) NOT NULL,
  PRIMARY KEY (`id_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `mapel` */

/*Table structure for table `mapel_aktif` */

DROP TABLE IF EXISTS `mapel_aktif`;

CREATE TABLE `mapel_aktif` (
  `id_mapel_aktif` int(11) NOT NULL AUTO_INCREMENT,
  `id_mapel` int(11) NOT NULL,
  `tahun_ajaran` year(4) NOT NULL,
  PRIMARY KEY (`id_mapel_aktif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `mapel_aktif` */

/*Table structure for table `masa_kbm` */

DROP TABLE IF EXISTS `masa_kbm`;

CREATE TABLE `masa_kbm` (
  `masa_kbm` int(11) NOT NULL AUTO_INCREMENT,
  `kbm_start` date NOT NULL,
  `kbm_end` date NOT NULL,
  PRIMARY KEY (`masa_kbm`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `masa_kbm` */

/*Table structure for table `pengampu` */

DROP TABLE IF EXISTS `pengampu`;

CREATE TABLE `pengampu` (
  `id_pengampu` int(11) NOT NULL,
  `id_guru` int(11) NOT NULL,
  `id_mapel_aktif` int(11) NOT NULL,
  PRIMARY KEY (`id_pengampu`,`id_guru`,`id_mapel_aktif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `pengampu` */

/*Table structure for table `presensi_kbm` */

DROP TABLE IF EXISTS `presensi_kbm`;

CREATE TABLE `presensi_kbm` (
  `kj_kbm` int(11) NOT NULL,
  `nis` int(11) NOT NULL,
  `status_presensi` int(11) NOT NULL COMMENT '1 = present, 0 = alpha, 2 = ijin, 3 = sakit, 4 = tk',
  PRIMARY KEY (`kj_kbm`,`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `presensi_kbm` */

/*Table structure for table `siswa` */

DROP TABLE IF EXISTS `siswa`;

CREATE TABLE `siswa` (
  `id_siswa` int(11) NOT NULL AUTO_INCREMENT,
  `nama_siswa` varchar(200) NOT NULL,
  `alamat` text,
  `handphone` varchar(15) DEFAULT NULL,
  `orangtua_siswa` varchar(200) DEFAULT NULL,
  `wali_siswa` varchar(200) DEFAULT NULL,
  `tahun_masuk` year(4) DEFAULT NULL,
  `id_user` int(11) NOT NULL,
  `email` varchar(200) NOT NULL,
  `nis` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_siswa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `siswa` */

insert  into `siswa`(`id_siswa`,`nama_siswa`,`alamat`,`handphone`,`orangtua_siswa`,`wali_siswa`,`tahun_masuk`,`id_user`,`email`,`nis`) values 
(1,'mt7v9',NULL,NULL,NULL,NULL,NULL,1,'mt7v9@gmail.com','22101');

/*Table structure for table `userlevel` */

DROP TABLE IF EXISTS `userlevel`;

CREATE TABLE `userlevel` (
  `id_userlevel` int(11) NOT NULL AUTO_INCREMENT,
  `level_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id_userlevel`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `userlevel` */

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `password` text NOT NULL,
  `key_A` text NOT NULL,
  `key_B` text NOT NULL,
  `level` int(11) NOT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `users` */

insert  into `users`(`id_user`,`password`,`key_A`,`key_B`,`level`) values 
(1,'6sdeeosuqkU4NlXx3hEaSlmhKoSlc8AngC42MlRDoNTIY2h+OZcVJ1EiA3cxOvGuSr8zb0/N038ZxVgMBsHXVH2cOjxDeiAO5Jr7CbVCIoIL4Z+PIedpTbm4d3z060cn7wIR8FUZud197+VGy18lCNnvc54J','AowROmTwcSAuPhHX+9xyhGsvRfpZ6x7Ue5xRj8H7wMDb2E7FHzhixFnrkTnomgNm','quSRWEzB/mh2Q9jIcQY6sGjNmYTCwObnuNb3ntybAFaUFyOSDRwIb9aJ9YuLjYnl',1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

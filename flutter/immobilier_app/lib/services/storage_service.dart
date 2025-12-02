import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;
  // [FIX] Increased timeout from 30s to 120s (2 minutes) for reliable Firebase Storage uploads
  static const Duration _uploadTimeout = Duration(seconds: 120);

  // Existing file upload for mobile with error handling and timeout
  Future<String> uploadFile(File file, String path) async {
    debugPrint('[StorageService] uploadFile START: path=$path');
    try {
      final ref = _storage.ref().child(path);
      debugPrint('[StorageService] uploadFile: Starting putFile...');
      final uploadTask = ref.putFile(file);
      debugPrint('[StorageService] uploadFile: Waiting for upload with ${_uploadTimeout.inSeconds}s timeout...');
      final task = await uploadTask.timeout(
        _uploadTimeout,
        onTimeout: () {
          debugPrint('[StorageService] uploadFile: TIMEOUT after ${_uploadTimeout.inSeconds}s');
          throw TimeoutException('Upload image timeout after ${_uploadTimeout.inSeconds}s');
        },
      );
      debugPrint('[StorageService] uploadFile: Upload completed, getting download URL...');
      final url = await task.ref.getDownloadURL();
      debugPrint('[StorageService] uploadFile SUCCESS: url=$url');
      return url;
    } catch (e) {
      debugPrint('[StorageService] uploadFile ERROR: $e');
      throw Exception('Échec de l\'upload de l\'image: $e');
    }
  }

  // Upload XFile (works for web and mobile) with error handling and timeout
  Future<String> uploadXFile(XFile file, String path) async {
    debugPrint('[StorageService] uploadXFile START: path=$path, kIsWeb=$kIsWeb');
    try {
      final ref = _storage.ref().child(path);
      if (kIsWeb) {
        debugPrint('[StorageService] uploadXFile: Reading bytes from web file...');
        final bytes = await file.readAsBytes();
        debugPrint('[StorageService] uploadXFile: Read ${bytes.length} bytes, starting putData...');
        final task = ref.putData(bytes, SettableMetadata(contentType: 'image/jpeg'));
        // Progress logging for web uploads
        task.snapshotEvents.listen((snap) {
          try {
            final transferred = snap.bytesTransferred;
            final total = snap.totalBytes;
            debugPrint('[StorageService] uploadXFile snapshot: $transferred/$total, state=${snap.state}');
          } catch (e) {
            debugPrint('[StorageService] uploadXFile snapshot logging error: $e');
          }
        });
        debugPrint('[StorageService] uploadXFile: Waiting for upload with ${_uploadTimeout.inSeconds}s timeout...');
        final uploadTask = await task.timeout(
          _uploadTimeout,
          onTimeout: () {
            debugPrint('[StorageService] uploadXFile: TIMEOUT after ${_uploadTimeout.inSeconds}s');
            throw TimeoutException('Upload image timeout after ${_uploadTimeout.inSeconds}s');
          },
        );
        debugPrint('[StorageService] uploadXFile: Upload completed, getting download URL...');
        final url = await uploadTask.ref.getDownloadURL();
        debugPrint('[StorageService] uploadXFile SUCCESS (web): url=$url');
        return url;
      } else {
        debugPrint('[StorageService] uploadXFile: Converting XFile to File for native...');
        final f = File(file.path);
        debugPrint('[StorageService] uploadXFile: Starting putFile...');
        final uploadTask = ref.putFile(f);
        // Progress logging for native uploads
        uploadTask.snapshotEvents.listen((snap) {
          try {
            final transferred = snap.bytesTransferred;
            final total = snap.totalBytes;
            debugPrint('[StorageService] uploadXFile snapshot (native): $transferred/$total, state=${snap.state}');
          } catch (e) {
            debugPrint('[StorageService] uploadXFile snapshot logging error (native): $e');
          }
        });
        debugPrint('[StorageService] uploadXFile: Waiting for upload with ${_uploadTimeout.inSeconds}s timeout...');
        final task = await uploadTask.timeout(
          _uploadTimeout,
          onTimeout: () {
            debugPrint('[StorageService] uploadXFile: TIMEOUT after ${_uploadTimeout.inSeconds}s');
            throw TimeoutException('Upload image timeout after ${_uploadTimeout.inSeconds}s');
          },
        );
        debugPrint('[StorageService] uploadXFile: Upload completed, getting download URL...');
        final url = await task.ref.getDownloadURL();
        debugPrint('[StorageService] uploadXFile SUCCESS (native): url=$url');
        return url;
      }
    } catch (e) {
      debugPrint('[StorageService] uploadXFile ERROR: $e');
      if (e is FirebaseException) {
        // Bubble a clearer message for auth/CORS/permission issues
        throw Exception('Échec upload (Firebase): code=${e.code}, message=${e.message}');
      }
      throw Exception('Échec de l\'upload de l\'image: $e');
    }
  }

  // Upload raw bytes with error handling and timeout
  Future<String> uploadBytes(Uint8List bytes, String path, {String contentType = 'image/jpeg'}) async {
    debugPrint('[StorageService] uploadBytes START: path=$path, bytes.length=${bytes.length}');
    try {
      final ref = _storage.ref().child(path);
      debugPrint('[StorageService] uploadBytes: Starting putData...');
      final task = ref.putData(bytes, SettableMetadata(contentType: contentType));
      debugPrint('[StorageService] uploadBytes: Waiting for upload with ${_uploadTimeout.inSeconds}s timeout...');
      final uploadTask = await task.timeout(
        _uploadTimeout,
        onTimeout: () {
          debugPrint('[StorageService] uploadBytes: TIMEOUT after ${_uploadTimeout.inSeconds}s');
          throw TimeoutException('Upload image timeout after ${_uploadTimeout.inSeconds}s');
        },
      );
      debugPrint('[StorageService] uploadBytes: Upload completed, getting download URL...');
      final url = await uploadTask.ref.getDownloadURL();
      debugPrint('[StorageService] uploadBytes SUCCESS: url=$url');
      return url;
    } catch (e) {
      debugPrint('[StorageService] uploadBytes ERROR: $e');
      throw Exception('Échec de l\'upload de l\'image: $e');
    }
  }
}

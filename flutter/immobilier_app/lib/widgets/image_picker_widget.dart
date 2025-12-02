import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class ImagePickerWidget extends StatefulWidget {
  final void Function(File) onImagePicked;
  const ImagePickerWidget({super.key, required this.onImagePicked});

  @override
  State<ImagePickerWidget> createState() => _ImagePickerWidgetState();
}

class _ImagePickerWidgetState extends State<ImagePickerWidget> {
  File? _picked;

  Future<void> _pick() async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1600);
    if (xfile == null) return;
    final file = File(xfile.path);
    setState(() => _picked = file);
    widget.onImagePicked(file);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_picked != null) Image.file(_picked!, width: 120, height: 80, fit: BoxFit.cover),
        TextButton.icon(onPressed: _pick, icon: const Icon(Icons.photo), label: const Text('Choisir une image'))
      ],
    );
  }
}

import 'package:client/widgets/TextPill.dart';
import 'package:flutter/material.dart';

class TagFieldController {
  Set<String> list = Set();
}

class TagField extends StatefulWidget {
  final TagFieldController controller;
  TagField({required this.controller});

  @override
  TagFieldState createState() => TagFieldState();
}

class TagFieldState extends State<TagField> {
  final TextEditingController _tag = TextEditingController();

  Widget _buildTextField() {
    return TextFormField(
        keyboardType: TextInputType.text,
        maxLength: 12,
        controller: _tag,
        // textInputAction: TextInputAction.next,
        decoration: const InputDecoration(
          hintText: 'Enter a tag',
          border: OutlineInputBorder(),
          contentPadding: EdgeInsets.only(left: 15.0),
        ));
  }

  @override
  build(BuildContext context) {
    return Container(
      child: Column(children: [
        Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildTextField()),
              IconButton(
                icon: Icon(
                  Icons.add,
                  color: widget.controller.list.length < 3
                      ? Colors.black
                      : Colors.grey,
                ),
                tooltip: 'Add the selected tag',
                onPressed: () {
                  setState(() {
                    if (widget.controller.list.length < 3)
                      widget.controller.list.add(_tag.text);
                    print(widget.controller.list);
                  });
                },
              )
            ]),
        Wrap(
          spacing: 5,
          runSpacing: -15,
          children: widget.controller.list
              .map((item) => Wrap(
                      spacing: -10,
                      runSpacing: -10,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        TextPill(item),
                        IconButton(
                          icon: const Icon(Icons.remove),
                          tooltip: 'Remove this tag',
                          onPressed: () {
                            setState(() {
                              widget.controller.list.remove(item);
                            });
                          },
                        )
                      ]))
              .toList(),
        )
      ]),
    );
  }
}

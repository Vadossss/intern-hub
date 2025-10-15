import { Card } from "../ui/card";
import { CheckboxFiltersGroup } from "./CheckboxFiltersGroups";

interface Props {
  className?: string;
}

export const Filters: React.FC<Props> = ({ className }) => {
  return (
    <div>
      <Card className="p-5">
        <div className="flex flex-col gap-5">
          <CheckboxFiltersGroup
            title={"Тип стажировки"}
            name={"type_internship"}
            items={[
              { text: "Оплачиваемая", value: "0" },
              { text: "Неоплачиваемая", value: "1" },
            ]}
          />
          <CheckboxFiltersGroup
            title={"Формат стажировки"}
            name={"format_internship"}
            items={[
              { text: "Очная", value: "0" },
              { text: "Дистанционная", value: "1" },
              { text: "Гибридная", value: "2" },
            ]}
          />
          <CheckboxFiltersGroup
            title={"Регион"}
            name={"region"}
            showSearchLabel={true}
            items={[
              { text: "Республика Адыгея", value: "0" },
              { text: "Республика Алтай", value: "1" },
              { text: "Республика Башкортостан", value: "2" },
              { text: "Бурятия", value: "3" },
              { text: "Республика Дагестан", value: "4" },
              { text: "Ингушетия", value: "5" },
              { text: "Кабардино-Балкарская Республика", value: "6" },
              { text: "Карачаево-Черкесская Республика", value: "7" },
              { text: "Республика Карелия", value: "8" },
              { text: "Хакасия", value: "9" },
              { text: "Республика Коми", value: "10" },
              { text: "Марий Эл", value: "11" },
              { text: "Мордовия", value: "12" },
              { text: "Республика Саха (Якутия)", value: "13" },
              { text: "Республика Северная Осетия — Алания", value: "14" },
              { text: "Татарстан", value: "15" },
              { text: "Тыва", value: "16" },
              { text: "Удмуртия", value: "17" },
              { text: "Чеченская Республика", value: "18" },
              { text: "Чувашская Республика — Чувашия", value: "19" },
              { text: "Крымская Республика", value: "20" },
              { text: "Алтайский край", value: "21" },
              { text: "Забайкальский край", value: "22" },
              { text: "Камчатский край", value: "23" },
              { text: "Краснодарский край", value: "24" },
              { text: "Красноярский край", value: "25" },
              { text: "Приморский край", value: "26" },
              { text: "Ставропольский край", value: "27" },
              { text: "Хабаровский край", value: "28" },
              { text: "Пермский край", value: "29" },
              { text: "Белгородская область", value: "30" },
              { text: "Брянская область", value: "31" },
              { text: "Ивановская область", value: "32" },
              { text: "Калужская область", value: "33" },
              { text: "Костромская область", value: "34" },
              { text: "Курская область", value: "35" },
              { text: "Липецкая область", value: "36" },
              { text: "Московская область", value: "37" },
              { text: "Орловская область", value: "38" },
              { text: "Рязанская область", value: "39" },
              { text: "Смоленская область", value: "40" },
              { text: "Тамбовская область", value: "41" },
              { text: "Тверская область", value: "42" },
              { text: "Тульская область", value: "43" },
              { text: "Владимирская область", value: "44" },
              { text: "Воронежская область", value: "45" },
              { text: "Амурская область", value: "46" },
              { text: "Архангельская область", value: "47" },
              { text: "Астраханская область", value: "48" },
              { text: "Вологодская область", value: "49" },
              { text: "Иркутская область", value: "50" },
              { text: "Калининградская область", value: "51" },
              { text: "Кемеровская область", value: "52" },
              { text: "Кировская область", value: "53" },
              { text: "Курганская область", value: "54" },
              { text: "Магаданская область", value: "55" },
              { text: "Нижегородская область", value: "56" },
              { text: "Новгородская область", value: "57" },
              { text: "Новосибирская область", value: "58" },
              { text: "Омская область", value: "59" },
              { text: "Оренбургская область", value: "60" },
              { text: "Пензенская область", value: "61" },
              { text: "Псковская область", value: "62" },
              { text: "Ростовская область", value: "63" },
              { text: "Самарская область", value: "64" },
              { text: "Саратовская область", value: "65" },
              { text: "Сахалинская область", value: "66" },
              { text: "Свердловская область", value: "67" },
              { text: "Томская область", value: "68" },
              { text: "Ульяновская область", value: "69" },
              { text: "Челябинская область", value: "70" },
              { text: "Москва", value: "71" },
              { text: "Санкт-Петербург", value: "72" },
              { text: "Севастополь", value: "73" },
              { text: "Еврейская автономная область", value: "74" },
              { text: "Ненецкий автономный округ", value: "75" },
              { text: "Ханты-Мансийский автономный округ", value: "76" },
              { text: "Ямало-Ненецкий автономный округ", value: "77" },
              { text: "Чукотский автономный округ", value: "78" },
            ]}
          />
          <CheckboxFiltersGroup
            title={"Тип стажировки"}
            items={[
              { text: "Оплачиваемая", value: "0" },
              { text: "Неоплачиваемая", value: "1" },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};
